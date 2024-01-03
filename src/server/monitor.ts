import "module-alias/register";
import { Monitor, AKTMonitor, ETHMonitor } from "../monitor";
import pino from "pino";
import config from "config";

function start(opts: any) {
  const services = {
    monitor: new Monitor({
      chainMonitors: [ETHMonitor, AKTMonitor],
      logger: opts.logger,
    }),
  };

  services.monitor.startMonitor();

  return services;
}

start({
  logger: pino(config.get("logger")),
});
