"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AKTTeller = void 0;
const redis_1 = __importDefault(require("redis"));
const launchpad_1 = require("@cosmjs/launchpad");
const config_1 = __importDefault(require("config"));
const stargate_1 = require("@cosmjs/stargate");
const redisClient = redis_1.default.createClient({
    host: "0.0.0.0",
});
const math_1 = require("@cosmjs/math");
class AKTTeller {
    logger;
    refreshRate = 0;
    constructor(opts) {
        this.logger = opts.logger;
        this.refreshRate = opts.refreshRate;
    }
    async start() {
        const wallet = await launchpad_1.Secp256k1HdWallet.fromMnemonic(
        // your mnemonic here 👇
        config_1.default.get("akt.pkey"), {
            prefix: "akash",
        });
        const [{ address }] = await wallet.getAccounts();
        const client = await stargate_1.SigningStargateClient.connectWithSigner("http://147.75.32.35:26657", wallet, {
            prefix: "akash",
            gasPrice: new stargate_1.GasPrice(math_1.Decimal.fromUserInput("0.025", 6), "uakt"),
        });
        const workFunction = async () => {
            redisClient?.lpop("wakt-burned-transaction-queue", async (err, reply) => {
                if (reply) {
                    this.logger.debug({
                        msg: "AKT Teller: Sending Funds",
                        reply: JSON.parse(reply),
                        address,
                    });
                    const recipient = JSON.parse(reply).address;
                    const amount = {
                        denom: "uakt",
                        amount: `${JSON.parse(reply).amount}`,
                    };
                    const result = await client.sendTokens(address, recipient, [
                        amount,
                    ]);
                }
            });
            setTimeout(workFunction, this.refreshRate);
        };
        workFunction();
    }
}
exports.AKTTeller = AKTTeller;
