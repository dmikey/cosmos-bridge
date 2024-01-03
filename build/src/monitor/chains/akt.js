"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AKTMonitor = void 0;
const base_1 = require("./base");
const child_process_1 = require("child_process");
const config_1 = __importDefault(require("config"));
const CURRENT_NET = config_1.default.get("akt.nets.testnet");
const AKT_REFERSH_RATE = config_1.default.get("akt.monitor.refresh");
const AKT_MONITOR_ADDRESS = config_1.default.get("akt.monitor.address");
const MONITOR_MESSAGE_TYPES = config_1.default.get("akt.monitor.messageTypes");
class AKTMonitor extends base_1.BaseMonitor {
    refreshRate = AKT_REFERSH_RATE;
    /**
     * Process the lastBlock
     */
    processBlock = async () => {
        if (this.lastBlock <= 0) {
            return;
        }
        // go back and look at the last block for transactions now that it's been completed
        const blockInfo = JSON.parse(child_process_1.execSync(`akash query block ${this.lastBlock} --node=${CURRENT_NET}`).toString());
        // get transactions
        const txs = blockInfo?.block?.data?.txs;
        this.logger.debug({
            msg: `${this.constructor.name}: Processing Block ${this.lastBlock}`,
            txCount: txs?.length || 0,
        });
        // parse the transactions for those `ma`tching our monitored exchange address
        if (txs) {
            this.logger.debug({
                msg: `${this.constructor.name}: Transactions Found`,
                block: this.lastBlock,
                txs,
            });
            txs.forEach((tx) => {
                const decodedTx = JSON.parse(child_process_1.execSync(`akash tx decode ${tx}`).toString());
                const messages = decodedTx?.body?.messages || [];
                let queueTx = false;
                // check each of these messages to see if they are being sent to our
                // conversion address, and then queue the transaction for processing
                messages.forEach((message) => {
                    if (MONITOR_MESSAGE_TYPES.indexOf(message["@type"]) > -1) {
                        if (message["to_address"].indexOf(AKT_MONITOR_ADDRESS) > -1) {
                            this.logger.info({
                                msg: `${this.constructor.name}: Decoded Transaction`,
                                block: this.lastBlock,
                                decodedTx,
                            });
                            queueTx = true;
                        }
                    }
                });
                if (queueTx) {
                    this.opts.redisClient?.rpush(["akt-recieved-transaction-queue", JSON.stringify(decodedTx)], function (err, reply) { });
                }
            });
        }
    };
    /**
     * Gets the block height that the network reports is the current block.
     * @returns Block Height
     */
    getCurrentBlock = async () => {
        const blockInfo = JSON.parse(child_process_1.execSync(`akash query block --node=${CURRENT_NET}`).toString());
        if (this.height !== blockInfo.block.header.height) {
            const txs = blockInfo?.block?.data?.txs;
            this.heightChanged(blockInfo.block.header.height);
        }
        return blockInfo.block.header.height;
    };
}
exports.AKTMonitor = AKTMonitor;
