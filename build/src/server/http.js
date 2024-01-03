"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Require the framework and instantiate it
require("module-alias/register");
const fastify_1 = __importDefault(require("fastify"));
const path_1 = __importDefault(require("path"));
const pino_1 = __importDefault(require("pino"));
const config_1 = __importDefault(require("config"));
const redis_1 = __importDefault(require("redis"));
const fastify_metrics_1 = __importDefault(require("fastify-metrics"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const redisClient = redis_1.default.createClient({
    host: "0.0.0.0",
});
var proxy = http_proxy_1.default.createProxyServer({});
const server = fastify_1.default({
    logger: pino_1.default(config_1.default.get("logger")),
});
// Declare a route
server.get("/", function (request, reply) {
    reply.sendFile("index.html");
});
server.register(require("fastify-static"), {
    root: path_1.default.join(__dirname, "../../public"),
    prefix: "/public/",
});
server.register(require("fastify-basic-auth"), {
    validate,
    authenticate: true,
});
function validate(username, password, req, reply, done) {
    if (username === "alpha" && password === "alpha") {
        done();
    }
    else {
        done(new Error("winter is coming"));
    }
}
server.register(fastify_metrics_1.default, { endpoint: "/metrics" });
// Declare a route
server.get("/stats", function (request, reply) {
    redisClient.get("AKTMonitor_lastBlock", (err, lastBlock) => {
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
server.addHook("onRequest", (req, res, next) => {
    if (req.url.indexOf("/akashnetwork") > -1) {
        next();
    }
    else {
        server.basicAuth(req, res, next);
    }
});
(async function () {
    await server.register(require("fastify-express"));
    server.use("/akashnetwork", function (req, res) {
        proxy.web(req, res, { target: "http://147.75.32.35:26657" });
    });
    // Run the server!
    server.listen(3000, "0.0.0.0", function (err, address) {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }
    });
})();
