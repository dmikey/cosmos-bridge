export { AKTMonitor } from "./chains/akt";
export { ETHMonitor } from "./chains/eth";
import { redisClient } from "../server/redisClient";

export type MonitorOpts = {
  chainMonitors: any[];
  logger: any;
};

export class Monitor {
  logger: any;
  redisClient: any;
  monitors: any[] = [];
  opts: any;
  constructor(opts: MonitorOpts) {
    this.logger = opts.logger;
    this.opts = opts;
    this.redisClient = redisClient;
    this.redisClient.on("error", (err: any) => {
      this.logger("Error " + err);
    });
  }
  async startMonitor() {
    this.logger.debug({ msg: "Starting Monitor Service" });

    // start new chain monitors
    this.opts.chainMonitors.forEach((Monitor: any) => {
      this.monitors.push(
        new Monitor({
          logger: this.logger,
          redisClient: this.redisClient,
        }).startMonitoring()
      );
    });
  }
}
