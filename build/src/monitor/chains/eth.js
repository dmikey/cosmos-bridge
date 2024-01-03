"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETHMonitor = void 0;
const redis_1 = __importDefault(require("redis"));
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const config_1 = __importDefault(require("config"));
const ethereum_input_data_decoder_1 = __importDefault(require("ethereum-input-data-decoder"));
const denoms_1 = require("../../banker/monetary/denoms");
const redisClient = redis_1.default.createClient({
    host: "0.0.0.0",
});
const bech32 = require("bech32");
// npm run build:contracts
const wAKT_json_1 = __importDefault(require("$contracts/wAKT.json"));
const decoder = new ethereum_input_data_decoder_1.default(wAKT_json_1.default.abi);
const encodeEthBaseAkashAddress = (base) => {
    const words = bech32.toWords(Buffer.from(base, "hex"));
    const data = bech32.encode("akash", words);
    return data;
};
class ETHMonitor {
    logger;
    web3 = new web3_1.default();
    contract;
    constructor(opts) {
        this.logger = opts.logger;
        this.logger.debug({
            msg: `${this.constructor.name}: Creating Banker`,
        });
    }
    startMonitoring = async () => {
        const provider = new hdwallet_provider_1.default(config_1.default.get("eth.pkey"), config_1.default.get("eth.nets.ropsten"));
        this.web3.setProvider(provider);
        this.contract = new this.web3.eth.Contract(wAKT_json_1.default.abi, config_1.default.get("eth.contractAddress"));
        const getSometStuff = async (blockNum) => {
            var block = await this.web3.eth.getBlock(blockNum, true);
            if (block && block.transactions) {
                this.logger.debug({ msg: "ETHMonitor: Refreshing", blockNum });
                block.transactions.forEach((e) => {
                    const decoded = decoder.decodeData(e.input);
                    if ("0xef8ce0b326a7045c02a3dc8dfaef1fcfad739232" == e.from.toLowerCase()) {
                        let amount = (decoded.inputs[0].toString(10) / denoms_1.decimals.wakt) * denoms_1.decimals.uakt;
                        // 20 byte constant
                        const address = encodeEthBaseAkashAddress(decoded.inputs[1].toString("hex").slice(0, 40));
                        this.logger.debug({
                            msg: "ETHMonitor: Burn Detected",
                            amount,
                            denom: "uakt",
                            address,
                        });
                        redisClient?.rpush([
                            "wakt-burned-transaction-queue",
                            JSON.stringify({ amount, address }),
                        ], function (err, reply) { });
                    }
                });
            }
        };
        let lastBlock = -1;
        const watchBlock = async () => {
            const blockNum = await this.web3.eth.getBlockNumber();
            if (lastBlock !== blockNum) {
                lastBlock = blockNum;
                await getSometStuff(lastBlock);
                this.logger.info({ msg: "refreshing", lastBlock });
            }
            setTimeout(watchBlock, 2000);
        };
        watchBlock();
    };
}
exports.ETHMonitor = ETHMonitor;
