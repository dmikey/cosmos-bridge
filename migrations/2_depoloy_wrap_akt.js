const Token = artifacts.require("wAKT");
const config = require("config");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "Wrapped Akash Token", "wAKT");
};
