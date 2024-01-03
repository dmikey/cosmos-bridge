const Migrations = artifacts.require("Migrations");
const config = require("config");

module.exports = function (deployer) {
  deployer.deploy(Migrations, {
    chainId: config.get("eth.chain_id").number,
  });
};
