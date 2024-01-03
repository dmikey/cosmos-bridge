const HDWalletProvider = require("@truffle/hdwallet-provider");
const config = require("config");

module.exports = {
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.0",
    },
  },
  plugins: ["truffle-plugin-verify"],
  api_keys: config.get("eth.api_keys"),
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 9545, // Standard Ethereum port (default: none)
      network_id: "5777", // Any network (default: none)
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(
          config.get("eth.pkey"),
          config.get("eth.nets.mainnet")
        ),
      network_id: 1,
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          config.get("eth.pkey"),
          config.get("eth.nets.ropsten")
        ),
      network_id: 3, // Ropsten's id
      gas: 5500000, // Ropsten has a lower block limit than mainnet
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
    },
  },
};
