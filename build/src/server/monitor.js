"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const monitor_1 = require("../monitor");
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("config"));
function start(opts) {
    const services = {
        monitor: new monitor_1.Monitor({
            chainMonitors: [monitor_1.ETHMonitor, monitor_1.AKTMonitor],
            logger: opts.logger,
        }),
    };
    services.monitor.startMonitor();
    return services;
}
start({
    logger: pino_1.default(config_1.default.get("logger")),
});
