"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETHTeller = void 0;
const redis_1 = __importDefault(require("redis"));
const pricer_1 = require("../../../pricer");
const coingecko_1 = require("../../../pricer/accountants/coingecko");
const DENOMS = ["uakt"];
const DENOM_MAP = {
    uakt: "1000000",
};
const redisClient = redis_1.default.createClient({
    host: "0.0.0.0",
});
class ETHTeller {
    logger;
    interval;
    refreshRate;
    pricer;
    constructor(opts) {
        this.logger = opts.logger;
        this.logger.debug({
            msg: `${this.constructor.name}: Creating Banker`,
        });
        this.refreshRate = opts.refreshRate;
        this.pricer = new pricer_1.Pricer(new coingecko_1.Accountant());
    }
    start = async () => {
        this.logger.debug({
            msg: `${this.constructor.name}: Starting Banker`,
        });
        if (!this.interval)
            this.interval = setInterval(async () => {
                redisClient?.lpop("akt-recieved-transaction-queue", async (err, reply) => {
                    if (reply) {
                        let tender = 0;
                        let tx = JSON.parse(reply);
                        const ethAddress = tx?.body?.memo;
                        tx?.body?.messages.forEach((message) => {
                            message?.amount.forEach((amount) => {
                                if (DENOMS.indexOf(amount.denom) > -1) {
                                    tender += parseInt(amount.amount, 10);
                                }
                            });
                        });
                        this.logger.info({
                            msg: `${this.constructor.name}: Processing Transaction`,
                        });
                        redisClient?.rpush([
                            "eth-send-tx-queue",
                            JSON.stringify({
                                tx,
                                tender,
                                denom: "uakt",
                                ethAddress,
                                price: (await this.pricer.getPrice("akash-network")).price,
                            }),
                        ], function (err, reply) { });
                    }
                });
            }, this.refreshRate);
    };
}
exports.ETHTeller = ETHTeller;
