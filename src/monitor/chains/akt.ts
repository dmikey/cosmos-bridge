import { BaseMonitor } from "./base";
import { execSync } from "child_process";
import config from "config";

const CURRENT_NET = config.get("akt.nets.testnet");
const AKT_REFERSH_RATE: any = config.get("akt.monitor.refresh");
const AKT_MONITOR_ADDRESS = config.get("akt.monitor.address");
const MONITOR_MESSAGE_TYPES: any[] = config.get("akt.monitor.messageTypes");

export class AKTMonitor extends BaseMonitor {
  refreshRate = AKT_REFERSH_RATE;
  /**
   * Process the lastBlock
   */
  processBlock = async () => {
    if (this.lastBlock <= 0) {
      return;
    }
    // go back and look at the last block for transactions now that it's been completed
    const blockInfo: any = JSON.parse(
      execSync(
        `akash query block ${this.lastBlock} --node=${CURRENT_NET}`
      ).toString()
    );

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

      txs.forEach((tx: any) => {
        const decodedTx: any = JSON.parse(
          execSync(`akash tx decode ${tx}`).toString()
        );

        const messages = decodedTx?.body?.messages || [];
        let queueTx: boolean = false;

        // check each of these messages to see if they are being sent to our
        // conversion address, and then queue the transaction for processing
        messages.forEach((message: any) => {
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
          this.opts.redisClient?.rpush(
            ["akt-recieved-transaction-queue", JSON.stringify(decodedTx)],
            function (err: any, reply: any) {}
          );
        }
      });
    }
  };

  /**
   * Gets the block height that the network reports is the current block.
   * @returns Block Height
   */
  getCurrentBlock = async () => {
    let height = this.height;

    if (this.height === -1) {
      const blockInfo: any = JSON.parse(
        execSync(`akash query block --node=${CURRENT_NET}`).toString()
      );
      height = this.height = blockInfo.block.header.height;
      this.heightChanged(blockInfo.block.header.height);
    }

    try {
      let execResp: any = execSync(
        `akash query block ${this.height} --node=${CURRENT_NET}`
      );
      if (execResp) execResp = execResp.toString();
      const blockInfo: any = JSON.parse(execResp);
      this.heightChanged(height);
      height++;
    } catch (e) {}

    return height;
  };
}
