"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Monitor = exports.ETHMonitor = exports.AKTMonitor = void 0;
var akt_1 = require("./chains/akt");
Object.defineProperty(exports, "AKTMonitor", { enumerable: true, get: function () { return akt_1.AKTMonitor; } });
var eth_1 = require("./chains/eth");
Object.defineProperty(exports, "ETHMonitor", { enumerable: true, get: function () { return eth_1.ETHMonitor; } });
const redisClient_1 = require("../server/redisClient");
class Monitor {
    logger;
    redisClient;
    monitors = [];
    opts;
    constructor(opts) {
        this.logger = opts.logger;
        this.opts = opts;
        this.redisClient = redisClient_1.redisClient;
        this.redisClient.on("error", (err) => {
            this.logger("Error " + err);
        });
    }
    async startMonitor() {
        this.logger.debug({ msg: "Starting Monitor Service" });
        // start new chain monitors
        this.opts.chainMonitors.forEach((Monitor) => {
            this.monitors.push(new Monitor({
                logger: this.logger,
                redisClient: this.redisClient,
            }).startMonitoring());
        });
    }
}
exports.Monitor = Monitor;
