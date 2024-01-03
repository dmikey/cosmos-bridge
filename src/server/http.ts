// Require the framework and instantiate it
import "module-alias/register";
import fastify from "fastify";
import path from "path";
import pino from "pino";
import config from "config";
import redis from "redis";
import metricsPlugin from "fastify-metrics";
import httpProxy from "http-proxy";

const redisClient = redis.createClient({
  host: "0.0.0.0",
});

var proxy = httpProxy.createProxyServer({});

const server = fastify({
  logger: pino(config.get("logger")),
});

server.register(require("fastify-cors"), {
  origin: false,
});

// Declare a route
server.get("/", function (request: any, reply: any) {
  reply.sendFile("index.html");
});

server.register(require("fastify-static"), {
  root: path.join(__dirname, "../../public"),
  prefix: "/public/",
});

// server.register(require("fastify-basic-auth"), {
//   validate,
//   authenticate: true,
// });
// function validate(
//   username: any,
//   password: any,
//   req: any,
//   reply: any,
//   done: any
// ) {
//   done();
// }

server.register(metricsPlugin, { endpoint: "/metrics" });

// Declare a route
server.get("/stats", function (request: any, reply: any) {
  redisClient.get("AKTMonitor_lastBlock", (err: any, lastBlock: any) => {
    reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        akash: {
          lastBlock,
        },
      });
  });
});

// server.addHook("onRequest", (req: any, res: any, next: any) => {
//   if (req.url.indexOf("/akashnetwork") > -1) {
//     next();
//   } else {
//     (server as any).basicAuth(req, res, next);
//   }
// });

(async function () {
  await server.register(require("fastify-express"));
  (server as any).use("/akashnetwork", function (req: any, res: any) {
    proxy.web(req, res, { target: "http://147.75.32.35:26657" });
  });

  // Run the server!
  server.listen(3000, "0.0.0.0", function (err: any, address: any) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
})();
