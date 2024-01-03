import "module-alias/register";
import { ETHTeller, ETHMinter } from "../banker/eth";
import { AKTTeller } from "../banker/akt";
import pino from "pino";
import config from "config";

const logger = pino(config.get("logger"));

logger.debug({
  msg: `Starting Banker Service`,
});

const ethteller = new ETHTeller({
  logger: logger,
  refreshRate: 1000,
});

ethteller.start();

const ethminter = new ETHMinter({
  logger: logger,
  refreshRate: 1000,
});

ethminter.start();

const aktteller = new AKTTeller({
  logger: logger,
  refreshRate: 1000,
});

aktteller.start();
