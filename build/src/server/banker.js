"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const eth_1 = require("../banker/eth");
const akt_1 = require("../banker/akt");
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("config"));
const logger = pino_1.default(config_1.default.get("logger"));
logger.debug({
    msg: `Starting Banker Service`,
});
const ethteller = new eth_1.ETHTeller({
    logger: logger,
    refreshRate: 1000,
});
ethteller.start();
const ethminter = new eth_1.ETHMinter({
    logger: logger,
    refreshRate: 1000,
});
ethminter.start();
const aktteller = new akt_1.AKTTeller({
    logger: logger,
    refreshRate: 1000,
});
aktteller.start();
