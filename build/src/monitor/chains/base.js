"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMonitor = void 0;
class BaseMonitor {
    interval;
    height = -1;
    lastBlock = -1;
    opts;
    logger;
    refreshRate = 0;
    constructor(opts) {
        this.logger = opts.logger;
        this.opts = opts;
        this.logger.debug({ msg: `${this.constructor.name}: Creating Monitor` });
    }
    /**
     * Returns the current block
     * @returns number
     */
    getCurrentBlock = async () => {
        return 1;
    };
    /**
     * Processes the lastBlock
     */
    processBlock = async () => {
        this.logger.warn(`${this.constructor.name} has no processBlock method defined`);
    };
    /**
     * How we start monitoring AKT Network
     */
    start = async () => {
        if (!this.interval)
            this.interval = setInterval(async () => {
                this.logger.debug({
                    msg: `Monitor: ${this.constructor.name} is refreshing`,
                });
                this.height = await this.getCurrentBlock();
                this.onNextBlock(() => this.processBlock());
            }, this.refreshRate);
    };
    /**
     * On the next block, we have the monitor process what ever it needs to do to
     * verify that a transaction is somewhere on the chain
     */
    onNextBlock = (process) => {
        this.opts.redisClient?.lpop(["next-block-queue"], (err, reply) => {
            this.lastBlock = reply;
            if (reply)
                process();
        });
    };
    /**
     * Performs some generic movement, when the heigh change is detected
     * @param height
     */
    heightChanged = async (height) => {
        if (this.height !== height) {
            this.lastBlock = this.height;
            this.height = height;
        }
        this.logger.debug({
            msg: `${this.constructor.name}: Block Height Changed`,
            height: this.height,
            lastBlock: this.lastBlock,
        });
        this.opts.redisClient?.set([
            `${this.constructor.name}_lastBlock`,
            this.lastBlock,
        ]);
        this.opts.redisClient?.rpush(["next-block-queue", height], function (err, reply) { });
    };
    /**
     * Starts the monitor calls monitor.monitor()
     * @returns self
     */
    startMonitoring() {
        this.start();
        this.logger.debug({ msg: `${this.constructor.name}: Starting Monitor` });
        return this;
    }
}
exports.BaseMonitor = BaseMonitor;
