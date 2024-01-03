import redis from "redis";
import {
  Secp256k1HdWallet,
  SigningCosmosClient,
  coins,
} from "@cosmjs/launchpad";
import config from "config";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
const redisClient: any = redis.createClient({
  host: "0.0.0.0",
});
import { Decimal } from "@cosmjs/math";

export class AKTTeller {
  logger: any;
  refreshRate: number = 0;
  constructor(opts: any) {
    this.logger = opts.logger;
    this.refreshRate = opts.refreshRate;
  }
  async start() {
    const wallet = await Secp256k1HdWallet.fromMnemonic(
      // your mnemonic here 👇
      config.get("akt.pkey"),
      {
        prefix: "akash",
      }
    );
    const [{ address }] = await wallet.getAccounts();

    const client = await SigningStargateClient.connectWithSigner(
      "http://147.75.32.35:26657",
      wallet,
      {
        prefix: "akash",
        gasPrice: new GasPrice(Decimal.fromUserInput("0.025", 6), "uakt"),
      }
    );

    const workFunction = async () => {
      redisClient?.lpop(
        "wakt-burned-transaction-queue",
        async (err: any, reply: any) => {
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
        }
      );
      setTimeout(workFunction, this.refreshRate);
    };
    workFunction();
  }
}
