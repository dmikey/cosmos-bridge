import redis from "redis";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import HDWalletProvider from "@truffle/hdwallet-provider";
import config from "config";

import { decimals } from "../../monetary/denoms";
import BigNumber from "bignumber.js";

// npm run build:contracts
import ethContract from "$contracts/wAKT.json";

const redisClient: any = redis.createClient({
  host: "0.0.0.0",
});

function isAddressValid(ethAddress: string): boolean {
  return Web3.utils.isAddress(ethAddress);
}

export class ETHMinter {
  interval: number = 2000;
  logger: any;
  web3: Web3 = new Web3();
  fromAddress: string = "";
  constructor(opts: any) {
    this.logger = opts.logger;
    this.logger.debug({
      msg: `${this.constructor.name}: Creating Banker`,
    });

    const provider = new HDWalletProvider(
      (config as any).get("eth.pkey"),
      (config as any).get("eth.nets.ropsten")
    );
    this.web3.setProvider(provider);
    this.fromAddress = provider.getAddress();

    this.logger.debug({
      msg: `${this.constructor.name}: Wallet Loaded`,
      fromAddress: this.fromAddress,
    });
  }
  getGasPrice = async () => {
    const gasPrice = new BigNumber(await this.web3.eth.getGasPrice());
    const E9 = 1e9;
    const maxGasPrice = new BigNumber(600 * E9);
    const minGasPrice = new BigNumber(20 * E9);
    if (gasPrice.lt(minGasPrice)) {
      return minGasPrice;
    } else if (gasPrice.gt(maxGasPrice)) {
      return maxGasPrice;
    } else {
      return gasPrice;
    }
  };
  mint = async () => {
    const accounts = await this.web3.eth.getAccounts();
    const contract = new this.web3.eth.Contract(
      (ethContract as any).abi as AbiItem,
      config.get("eth.contractAddress")
    );

    // get total minted supply
    redisClient?.lpop("eth-send-tx-queue", async (err: any, reply: any) => {
      const parsedReply: any = JSON.parse(reply);
      if (reply) {
        this.logger.info({
          msg: "oo",
        });

        const atkPerEth: any = new BigNumber(parsedReply.price.eth);

        this.logger.info({
          msg: `${this.constructor.name}: Minting Transaction`,
          tender: parsedReply.tender,
          denom: parsedReply.denom,
          ethAddress: parsedReply.ethAddress,
          price: atkPerEth,
        });

        if (isAddressValid(parsedReply.ethAddress)) {
          const gasPrice = await this.getGasPrice();
          const gasLimit = await contract.methods
            .mint(parsedReply.ethAddress, new BigNumber(1))
            .estimateGas({
              from: this.fromAddress,
            });

          const txFeeEstimate: any = new BigNumber(
            gasLimit * (gasPrice as any)
          );

          const feeInATK: any = new BigNumber(
            ((txFeeEstimate * atkPerEth) / decimals.wakt) * decimals.uakt
          );

          // send some money
          const mintValue: any = new BigNumber(
            ((parsedReply.tender - feeInATK) / decimals.uakt) * decimals.wakt
          );

          this.logger.info({
            msg: `${this.constructor.name}: recipient address valid ${parsedReply.ethAddress}`,
            mintValue,
            gasPrice,
            gasLimit,
            txFeeEstimate,
            feeInATK,
          });

          contract.methods
            .mint(parsedReply.ethAddress, mintValue)
            .send({ from: this.fromAddress, gasPrice })
            .then((res: any) => {
              console.log(res);
            });

          // queue up check to see if transaction confirmed
        } else {
          this.logger.info({
            msg: `${this.constructor.name}: recipient address invalid ${parsedReply.ethAddress}`,
          });
        }
      }
    });
    setTimeout(this.mint, this.interval);
  };
  start = async () => {
    this.logger.info({
      msg: `${this.constructor.name}: Starting Banker`,
    });
    this.mint();
  };
}
