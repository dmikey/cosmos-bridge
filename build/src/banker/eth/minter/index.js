"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETHMinter = void 0;
const redis_1 = __importDefault(require("redis"));
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const config_1 = __importDefault(require("config"));
const denoms_1 = require("../../monetary/denoms");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
// npm run build:contracts
const wAKT_json_1 = __importDefault(require("$contracts/wAKT.json"));
const redisClient = redis_1.default.createClient({
    host: "0.0.0.0",
});
function isAddressValid(ethAddress) {
    return web3_1.default.utils.isAddress(ethAddress);
}
class ETHMinter {
    interval = 2000;
    logger;
    web3 = new web3_1.default();
    fromAddress = "";
    constructor(opts) {
        this.logger = opts.logger;
        this.logger.debug({
            msg: `${this.constructor.name}: Creating Banker`,
        });
        const provider = new hdwallet_provider_1.default(config_1.default.get("eth.pkey"), config_1.default.get("eth.nets.ropsten"));
        this.web3.setProvider(provider);
        this.fromAddress = provider.getAddress();
        this.logger.debug({
            msg: `${this.constructor.name}: Wallet Loaded`,
            fromAddress: this.fromAddress,
        });
    }
    getGasPrice = async () => {
        const gasPrice = new bignumber_js_1.default(await this.web3.eth.getGasPrice());
        const E9 = 1e9;
        const maxGasPrice = new bignumber_js_1.default(600 * E9);
        const minGasPrice = new bignumber_js_1.default(20 * E9);
        if (gasPrice.lt(minGasPrice)) {
            return minGasPrice;
        }
        else if (gasPrice.gt(maxGasPrice)) {
            return maxGasPrice;
        }
        else {
            return gasPrice;
        }
    };
    mint = async () => {
        const accounts = await this.web3.eth.getAccounts();
        const contract = new this.web3.eth.Contract(wAKT_json_1.default.abi, config_1.default.get("eth.contractAddress"));
        // get total minted supply
        redisClient?.lpop("eth-send-tx-queue", async (err, reply) => {
            const parsedReply = JSON.parse(reply);
            if (reply) {
                this.logger.info({
                    msg: "oo",
                });
                const atkPerEth = new bignumber_js_1.default(parsedReply.price.eth);
                this.logger.info({
                    msg: `${this.constructor.name}: Minting Transaction`,
                    tender: parsedReply.tender,
                    denom: parsedReply.denom,
                    ethAddress: parsedReply.ethAddress,
                    price: atkPerEth,
                });
                if (isAddressValid(parsedReply.ethAddress)) {
                    const gasPrice = await this.getGasPrice();
                    const gasLimit = await contract.methods
                        .mint(parsedReply.ethAddress, new bignumber_js_1.default(1))
                        .estimateGas({
                        from: this.fromAddress,
                    });
                    const txFeeEstimate = new bignumber_js_1.default(gasLimit * gasPrice);
                    const feeInATK = new bignumber_js_1.default(((txFeeEstimate * atkPerEth) / denoms_1.decimals.wakt) * denoms_1.decimals.uakt);
                    // send some money
                    const mintValue = new bignumber_js_1.default(((parsedReply.tender - feeInATK) / denoms_1.decimals.uakt) * denoms_1.decimals.wakt);
                    this.logger.info({
                        msg: `${this.constructor.name}: recipient address valid ${parsedReply.ethAddress}`,
                        mintValue,
                        gasPrice,
                        gasLimit,
                        txFeeEstimate,
                        feeInATK,
                    });
                    contract.methods
                        .mint(parsedReply.ethAddress, mintValue)
                        .send({ from: this.fromAddress, gasPrice })
                        .then((res) => {
                        console.log(res);
                    });
                    // queue up check to see if transaction confirmed
                }
                else {
                    this.logger.info({
                        msg: `${this.constructor.name}: recipient address invalid ${parsedReply.ethAddress}`,
                    });
                }
            }
        });
        setTimeout(this.mint, this.interval);
    };
    start = async () => {
        this.logger.info({
            msg: `${this.constructor.name}: Starting Banker`,
        });
        this.mint();
    };
}
exports.ETHMinter = ETHMinter;
