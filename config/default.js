const envConfig = require("dotenv").config().parsed;

module.exports = {
  logger: {
    level: "debug",
  },
  eth: {
    chain_id: {
      number: 3,
      name: "ropsten",
    },
    api_keys: {
      etherscan: envConfig.ETHERSCAN_API_KEY,
    },
    pkey: envConfig.ETH_PKEY,
    contractAddress: envConfig.ETH_CONTRACT_ADDRESS,
    nets: {
      ropsten: envConfig.ETH_RPC_ROPSTEN,
      mainnet: envConfig.ETH_RPC_MAINNET,
    },
  },
  akt: {
    pkey: envConfig.AKASH_MNEUMONIC,
    nets: {
      mainnet: envConfig.AKASH_RPC_MAINNET,
      testnet: envConfig.AKASH_RPC_TESTNET,
    },
    monitor: {
      refresh: 5000,
      messageTypes: ["/cosmos.bank.v1beta1.MsgSend"],
      address: envConfig.AKASH_ACCOUNT_ADDRESS,
    },
  },
};
