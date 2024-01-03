import redis from "redis";
import { Pricer } from "../../../pricer";
import { Accountant as CoinGeckoAccountant } from "../../../pricer/accountants/coingecko";

const DENOMS = ["uakt"];
const DENOM_MAP = {
  uakt: "1000000",
};

const redisClient: any = redis.createClient({
  host: "0.0.0.0",
});

export class ETHTeller {
  logger: any;
  interval: any;
  refreshRate: number;
  pricer: Pricer;
  constructor(opts: any) {
    this.logger = opts.logger;
    this.logger.debug({
      msg: `${this.constructor.name}: Creating Banker`,
    });
    this.refreshRate = opts.refreshRate;
    this.pricer = new Pricer(new CoinGeckoAccountant());
  }

  start = async () => {
    this.logger.debug({
      msg: `${this.constructor.name}: Starting Banker`,
    });
    if (!this.interval)
      this.interval = setInterval(async () => {
        redisClient?.lpop(
          "akt-recieved-transaction-queue",
          async (err: any, reply: any) => {
            if (reply) {
              let tender = 0;
              let tx = JSON.parse(reply);
              const ethAddress = tx?.body?.memo;
              tx?.body?.messages.forEach((message: any) => {
                message?.amount.forEach((amount: any) => {
                  if (DENOMS.indexOf(amount.denom) > -1) {
                    tender += parseInt(amount.amount, 10);
                  }
                });
              });

              this.logger.info({
                msg: `${this.constructor.name}: Processing Transaction`,
              });

              redisClient?.rpush(
                [
                  "eth-send-tx-queue",
                  JSON.stringify({
                    tx,
                    tender,
                    denom: "uakt",
                    ethAddress,
                    price: (await this.pricer.getPrice("akash-network")).price,
                  }),
                ],
                function (err: any, reply: any) {}
              );
            }
          }
        );
      }, this.refreshRate);
  };
}
