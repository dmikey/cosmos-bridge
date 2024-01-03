import { BaseMonitor } from "./base";
import redis from "redis";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import HDWalletProvider from "@truffle/hdwallet-provider";
import config from "config";
import InputDataDecoder from "ethereum-input-data-decoder";
import { decimals } from "../../banker/monetary/denoms";

const redisClient = redis.createClient({
  host: "0.0.0.0",
});

const bech32 = require("bech32");

// npm run build:contracts
import ethContract from "$contracts/wAKT.json";
const decoder = new InputDataDecoder(ethContract.abi);

const encodeEthBaseAkashAddress = (base: any) => {
  const words = bech32.toWords(Buffer.from(base, "hex"));
  const data = bech32.encode("akash", words);
  return data;
};

export class ETHMonitor {
  logger: any;
  web3: Web3 = new Web3();
  contract: any;
  provider: any;
  constructor(opts: any) {
    this.provider = new HDWalletProvider(
      (config as any).get("eth.pkey"),
      (config as any).get("eth.nets.ropsten")
    );

    this.web3.setProvider(this.provider);
    this.logger = opts.logger;
    this.logger.debug({
      msg: `${this.constructor.name}: Creating Banker`,
    });

    this.contract = new this.web3.eth.Contract(
      (ethContract as any).abi as AbiItem,
      config.get("eth.contractAddress")
    );
  }
  startMonitoring = async () => {
    const getSometStuff = async (block: any, blockNum: any) => {
      // var block = await this.web3.eth.getBlock(blockNum, true);
      if (block && block.transactions) {
        this.logger.debug({ msg: "ETHMonitor: Refreshing", blockNum });

        block.transactions.forEach(async (e: any) => {
          // console.log(e);
          const decoded = decoder.decodeData(e.input);
          var txInfo = await this.web3.eth.getTransactionReceipt(e.hash);
          if (
            txInfo?.to?.toLowerCase() ==
              "0x0977709831e88ef7b186238bcdcc902be6d11a8e" ||
            "0x0977709831e88ef7b186238bcdcc902be6d11a8e" ==
              txInfo?.contractAddress?.toLowerCase()
          ) {
            console.log(txInfo);
            let amount =
              (decoded.inputs[0].toString(10) / decimals.wakt) * decimals.uakt;
            if (amount) {
              // this was a burn
              // 20 byte constant
              const address = encodeEthBaseAkashAddress(
                decoded.inputs[1].toString("hex").slice(0, 40)
              );

              this.logger.debug({
                msg: "ETHMonitor: Burn Detected",
                amount,
                denom: "uakt",
                address,
              });

              redisClient?.rpush(
                [
                  "wakt-burned-transaction-queue",
                  JSON.stringify({ amount, address } as any),
                ] as any,
                function (err: any, reply: any) {}
              );
            }
          }
        });
      }
    };

    let lastBlock = -1;
    const watchBlock = async () => {
      if (lastBlock == -1) {
        lastBlock = await this.web3.eth.getBlockNumber();
      }

      var block = await this.web3.eth.getBlock(lastBlock, true);

      if (block) {
        getSometStuff(block, lastBlock);
        lastBlock++;
      }

      setTimeout(watchBlock, 2000);
    };
    watchBlock();
  };
}
