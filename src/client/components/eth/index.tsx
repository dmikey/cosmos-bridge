import React, { useRef, useEffect, useState } from "react";
import { Form, Button, Space, message, Row, Radio, Result } from "antd";

import Web3 from "web3";
import ethContract from "$contracts/wAKT.json";

import BigNumber from "bignumber.js";
import { decimals } from "../../../banker/monetary/denoms";
import { SigningStargateClient } from "@cosmjs/stargate";

const bech32 = require("bech32");

const decodeAkashAddressEtherBase = (address: string) => {
  try {
    const { words, prefix } = bech32.decode(address);
    const data = bech32.fromWords(words);
    return "0x" + Buffer.from(data).toString("hex");
  } catch (error) {
    return error;
  }
};

export default function () {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [keplrToEthAddress, setKeplrToEthAddress] = useState("");
  const [keplrSelectedAddress, setKeplrSelectedAddress] = useState("");
  const [funds, setFunds] = useState(0.000001);
  const [mode, setMode] = useState("send");
  const [recvAddress, setRecvAddress] = useState("");

  const burnWAKT = () => {
    if ((window as any)?.ethereum?.selectedAddress.length == 0) {
      message.error("MetaMask Wallet is not connected.");
      return;
    }
    const web3 = new Web3((window as any)?.ethereum);
    let myContract = new web3.eth.Contract(
      (ethContract as any).abi as any,
      "0x0977709831e88EF7b186238BcDCc902bE6d11a8E"
    );
    myContract.methods
      .burn(
        `${funds * decimals.wakt}`,
        `${keplrToEthAddress}000000000000000000000000`
      )
      .send({ from: (window as any)?.ethereum?.selectedAddress })
      .on("transactionHash", function (hash: any) {
        message.info(`Transaction approved: ${hash}`);
      })
      .on("error", function (error: any) {
        message.error(error.message);
      });
  };

  const connectMetaMask = () => {
    (window as any)?.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (accounts: any) => {
        setSelectedAddress((window as any)?.ethereum.selectedAddress);
        message.info("MetaMask Wallet connected");
      })
      .catch((error: any) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          message.warn("Please connect to Etherum Wallet.");
        } else {
          message.info(error.message);
        }
      });
  };

  const registerTokenWithMetaMask = async () => {
    const tokenAddress = "0x0977709831e88EF7b186238BcDCc902bE6d11a8E";
    const tokenSymbol = "wAKT";
    const tokenDecimals = 18;
    const tokenImage = "https://akash.network/favicon.png";

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await (window as any)?.ethereum?.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (!wasAdded) {
        message.info("User declined to add wAKT to wallet.");
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const addTestNetKeplr = async () => {
    if ((window as any)?.keplr?.experimentalSuggestChain) {
      try {
        (window as any)?.keplr.experimentalSuggestChain({
          chainId: "akash-testnet-6",
          chainName: "Akash Testnet 6",
          rpc: "http://147.75.32.35:26657",
          rest: "http://147.75.32.35:1317",
          stakeCurrency: {
            coinDenom: "AKT",
            coinMinimalDenom: "uakt",
            coinDecimals: 6,
          },
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: "akash",
            bech32PrefixAccPub: "akashpub",
            bech32PrefixValAddr: "akashvaloper",
            bech32PrefixValPub: "akashvaloperpub",
            bech32PrefixConsAddr: "akashvalcons",
            bech32PrefixConsPub: "akashvalconspub",
          },
          currencies: [
            {
              coinDenom: "AKT",
              coinMinimalDenom: "uakt",
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: "AKT",
              coinMinimalDenom: "uakt",
              coinDecimals: 6,
            },
          ],
          gasPriceStep: {
            low: 0.0001,
            average: 0.005,
            high: 0.04,
          },
        });
      } catch {
        message.error("Failed to suggest the chain");
      }
    } else {
      message.warn("Update to a later Keplr version");
    }
  };

  const sendKeplrTransaction = () => {
    (async () => {
      // See above.
      const chainId = "akash-testnet-6";
      await (window as any).keplr.enable(chainId);
      const offlineSigner = (window as any).getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      const client = await SigningStargateClient.connectWithSigner(
        `${window.location.origin}/akashnetwork`,
        offlineSigner
      );

      const recipient = "akash1g2k9az8fafgnhaxczj2pcf7dxzm96r3w0ea3fv";
      const amount = {
        denom: "uakt",
        amount: `${funds * decimals.uakt}`,
      };

      try {
        const result = await client.sendTokens(
          accounts[0].address,
          recipient,
          [amount],
          `${selectedAddress}`
        );
      } catch (error) {
        message.error(`Akash Transport : ${error.message}`);
      }
    })();
  };

  const connectKeplrWallet = () => {
    const chainId = "akash-testnet-6";
    (window as any).keplr?.enable(chainId).then(async () => {
      await addTestNetKeplr();
      const key = await (window as any).keplr?.getKey(chainId);
      setKeplrSelectedAddress(key.bech32Address);
      setKeplrToEthAddress(decodeAkashAddressEtherBase(key.bech32Address));
    });
  };

  function swapTokenUI() {
    const $ = (window as any).$;
    if ($(".creditcard").hasClass("flipped")) {
      $(".creditcard").removeClass("flipped");
      $("#recvAddress").val(selectedAddress);
      $("#actionButton").text("Transport");
      $("#actionButton").addClass("akash");
      $("#actionButton").removeClass("ether");
      $(".payment-select").removeClass("flipped");
      $(".payment-select .arrow").removeClass("flipped");
      $("#akash").removeClass("flipped");
      setRecvAddress(selectedAddress);
    } else {
      $(".creditcard").addClass("flipped");
      $("#recvAddress").val(keplrSelectedAddress);
      setRecvAddress(keplrSelectedAddress);
      $("#actionButton").text("Burn");
      $("#actionButton").addClass("ether");
      $("#actionButton").removeClass("akash");
      $("#akash").addClass("flipped");
      $(".payment-select .arrow").addClass("flipped");
      $(".payment-select").addClass("flipped");
    }
  }

  useEffect(() => {
    const $ = (window as any).$;
    $(() => {
      (window as any)?.ethereum.on(
        "accountsChanged",
        (accounts: Array<string>) => {
          setSelectedAddress((window as any)?.ethereum.selectedAddress);
        }
      );

      (window as any)?.ethereum.on("chainChanged", (chainId: string) => {
        console.log(chainId);
      });

      (window as any)?.ethereum.on("connect", (chainId: string) => {
        setSelectedAddress((window as any)?.ethereum.selectedAddress);
      });

      if ((window as any)?.ethereum?.isConnected()) {
        setSelectedAddress((window as any)?.ethereum.selectedAddress);
      }

      const getKeplr = () => {
        const chainId = "akash-testnet-6";
        const keplr = (window as any).keplr;
        keplr
          ? keplr.enable(chainId).then(async () => {
              const key = await (window as any).keplr?.getKey(chainId);
              setKeplrSelectedAddress(key.bech32Address);
              setKeplrToEthAddress(
                decodeAkashAddressEtherBase(key.bech32Address)
              );
            })
          : setTimeout(getKeplr, 100);
      };
      getKeplr();
    });

    $(".click").on("click", () => {
      swapTokenUI();
      setMode(mode == "send" ? "get" : "send");
    });

    $("#actionButton").on("click", function () {
      if ($(".creditcard").hasClass("flipped")) {
        burnWAKT();
      } else {
        sendKeplrTransaction();
      }
    });

    return () => {
      $("#actionButton").off("click");
      $(".click").off("click");
    };
  });

  const [form] = Form.useForm();

  if (!(window as any).keplr || !(window as any).ethereum) {
    return (
      <Result
        style={{
          top: "50%",
          position: "relative",
          transform: "TranslateY(-50%)",
        }}
        status="500"
        title="Keplr or MetaMask not installed/enabled."
        subTitle="The site could not find Keplr or MetaMask extensions installed or enabled. Once installed, come back and refresh this page."
        extra={
          <>
            <Button
              onClick={() => {
                (window as any).open(
                  "https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap",
                  "_blank"
                );
              }}
              style={{ borderRadius: "5px" }}
              type="primary"
            >
              Get Keplr Extension
            </Button>
            <Button
              onClick={() => {
                (window as any).open(
                  "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
                  "_blank"
                );
              }}
              style={{ borderRadius: "5px" }}
              type="primary"
            >
              Get MetaMask Extension
            </Button>
          </>
        }
      />
    );
  }
  if (
    selectedAddress?.length == 0 ||
    !selectedAddress ||
    keplrSelectedAddress?.length == 0 ||
    !keplrSelectedAddress
  ) {
    return (
      <Result
        style={{
          top: "50%",
          position: "relative",
          transform: "TranslateY(-50%)",
        }}
        status="403"
        title="Wallets are Locked."
        subTitle="Sorry, to use this page you must connect Keplr and MetaMask."
        extra={
          <>
            <Button
              style={{ borderRadius: "5px" }}
              key="3"
              type={selectedAddress?.length > 0 ? "primary" : "default"}
              onClick={connectMetaMask}
            >
              {selectedAddress?.length > 0
                ? "MetaMask Connected"
                : "Connect MetaMask"}
            </Button>
            <Button
              style={{ borderRadius: "5px" }}
              type={keplrSelectedAddress?.length > 0 ? "primary" : "default"}
              onClick={connectKeplrWallet}
              key="2"
            >
              {keplrSelectedAddress?.length > 0
                ? "Keplr Connected"
                : "Connect Keplr"}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <>
      <Row style={{ padding: "7px", position: "absolute" }}>
        <Space>
          <Button
            style={{ borderRadius: "5px" }}
            key="3"
            type={selectedAddress?.length > 0 ? "primary" : "default"}
            onClick={connectMetaMask}
          >
            {selectedAddress?.length > 0
              ? "MetaMask Connected"
              : "Connect MetaMask"}
          </Button>
          <Button
            style={{ borderRadius: "5px" }}
            type={keplrSelectedAddress?.length > 0 ? "primary" : "default"}
            onClick={connectKeplrWallet}
            key="2"
          >
            {keplrSelectedAddress?.length > 0
              ? "Keplr Connected"
              : "Connect Keplr"}
          </Button>
        </Space>
      </Row>
      <div className="foo-container">
        <Radio.Group
          style={{ marginBottom: "25px" }}
          value={mode}
          onChange={(e: any) => {
            setMode(e.target.value);
            swapTokenUI();
          }}
        >
          <Radio.Button value="send">Wrap $AKT</Radio.Button>
          <Radio.Button value="get">Unwrap $AKT</Radio.Button>
        </Radio.Group>
        <div className="payment-title click">
          <div className="payment-select">
            <img
              width="64"
              id="akash"
              src="public/favicon.png"
              style={{ cursor: "pointer" }}
            />
            <img
              className="arrow"
              style={{ cursor: "pointer", marginLeft: "15px" }}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVRoge3YOwrCQBRG4aOFC7K0trBQF6Ck8LFVK7GwcQFWgr2PwkczIqghOIHM3Mv/wW2TORAmk4CIiIiISIZ6wCZMP/FaatkBjzBXYJR2OfH2vENMx0yAG98xw5SLijXjd8w45aJiKSZXZTEmNwDF/KMAjh83aHLOwKBuRAc4JYx4zYWK90y7IqQVLuTCFDhg/NFq0hwHR5eyCFPb7wJF5GGJg3OWi4gCuGN8dwJHn7pbHEQAdIEVsMb47yARERERMeYJNfrJWQinGi4AAAAASUVORK5CYII="
            />
            <img
              height="64"
              src="public/etherakt.png"
              style={{ cursor: "pointer", marginLeft: "20px" }}
            />
          </div>
        </div>
        <div className="container">
          <div className="creditcard click">
            <div className="front">
              <svg
                style={{ position: "absolute", right: "20px", top: "15px" }}
                width="120"
                height="56"
                viewBox="0 0 240 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M120.972 25.021L127.922 14.7078H139.251L129.196 29.6074L139.567 45.1979H128.247L120.972 34.2105V45.1979H111.574V1.53955H120.972V25.021Z"
                  fill="white"
                />
                <path
                  d="M238.644 24.1886V45.1895H229.255V24.4133C229.255 22.2991 227.523 20.5677 225.409 20.5677C223.278 20.5677 221.555 22.2991 221.555 24.4133V45.1895H212.166V1.53955H221.555V15.6734C223.353 14.3332 225.576 13.5341 227.981 13.5341C233.875 13.5258 238.644 18.2954 238.644 24.1886Z"
                  fill="white"
                />
                <path
                  d="M96.9476 14.7077V16.2143C94.4005 14.5661 91.3623 13.6006 88.0994 13.6006C79.0764 13.6006 71.7598 20.9172 71.7598 29.9402C71.7598 38.9632 79.0764 46.2798 88.1077 46.2798C91.3706 46.2798 94.4005 45.3143 96.9559 43.6661V45.256H106.345V14.7077H96.9476V14.7077ZM89.4728 37.8978C84.8781 37.8978 81.149 34.1687 81.149 29.574C81.149 24.9792 84.8781 21.2502 89.4728 21.2502C94.0675 21.2502 97.7966 24.9792 97.7966 29.574C97.7966 34.1687 94.0759 37.8978 89.4728 37.8978Z"
                  fill="white"
                />
                <path
                  d="M164.752 14.7077V16.2143C162.205 14.5661 159.167 13.6006 155.904 13.6006C146.881 13.6006 139.564 20.9172 139.564 29.9402C139.564 38.9632 146.881 46.2798 155.904 46.2798C159.167 46.2798 162.197 45.3143 164.752 43.6661V45.256H174.141V14.7077H164.752V14.7077ZM157.277 37.8978C152.683 37.8978 148.954 34.1687 148.954 29.574C148.954 24.9792 152.683 21.2502 157.277 21.2502C161.872 21.2502 165.601 24.9792 165.601 29.574C165.601 34.1687 161.872 37.8978 157.277 37.8978Z"
                  fill="white"
                />
                <path
                  d="M187.844 35.3259C187.886 35.9502 188.052 36.4829 188.335 36.9074C188.635 37.3569 189.026 37.7232 189.492 38.0062C190 38.3058 190.591 38.5306 191.265 38.6721C191.973 38.8219 192.705 38.8968 193.463 38.8968C195.152 38.8968 196.426 38.6388 197.25 38.1393C197.941 37.7148 198.249 37.257 198.249 36.6577C198.249 36.383 198.191 36.1583 198.074 35.9668C198.007 35.8586 197.824 35.6339 197.317 35.3509C196.842 35.0845 196.193 34.8348 195.377 34.6017C194.52 34.3603 193.404 34.1023 192.056 33.8526C190.275 33.4947 188.618 33.0452 187.128 32.5041C185.605 31.9548 184.282 31.2722 183.183 30.4814C182.051 29.6574 181.143 28.6918 180.503 27.6097C179.837 26.486 179.495 25.1875 179.495 23.7392C179.495 22.3574 179.828 21.009 180.486 19.7521C181.143 18.5035 182.084 17.4048 183.291 16.4808C184.473 15.5735 185.93 14.841 187.611 14.3166C189.276 13.7922 191.174 13.5259 193.246 13.5259C195.402 13.5259 197.375 13.7839 199.106 14.2917C200.863 14.8077 202.377 15.5402 203.618 16.4559C204.883 17.3964 205.865 18.5368 206.539 19.8353C207.214 21.1422 207.555 22.5822 207.555 24.1137H197.899C197.899 23.2564 197.566 22.5822 196.859 21.9829C196.11 21.3586 194.894 21.0506 193.238 21.0506C191.681 21.0506 190.524 21.3086 189.792 21.8247C189.151 22.2742 188.86 22.7653 188.86 23.3646C188.86 23.6476 188.918 23.9057 189.034 24.147C189.134 24.3551 189.342 24.5632 189.65 24.763C190.033 25.0127 190.591 25.2541 191.307 25.4705C192.064 25.7036 193.055 25.9117 194.237 26.0782C196.076 26.3778 197.808 26.769 199.381 27.2352C201.004 27.718 202.436 28.3589 203.626 29.1247C204.866 29.9321 205.857 30.9226 206.564 32.0796C207.288 33.2699 207.663 34.6933 207.663 36.2998C207.663 37.7897 207.297 39.1798 206.581 40.4367C205.873 41.677 204.866 42.7507 203.584 43.6414C202.336 44.507 200.813 45.1896 199.056 45.6641C197.325 46.1302 195.385 46.3716 193.271 46.3716C190.932 46.3716 188.835 46.0553 187.02 45.4393C185.205 44.815 183.649 43.991 182.409 42.9755C181.143 41.9433 180.178 40.753 179.52 39.4295C178.863 38.0977 178.521 36.7326 178.521 35.3675L187.844 35.3259Z"
                  fill="white"
                />
                <path
                  d="M51.576 54.0465L61.6644 36.5499L41.4709 1.54834H21.2773L51.576 54.0465Z"
                  fill="white"
                />
                <path
                  d="M41.4792 36.5498L51.5676 54.0464H31.3824L21.2773 36.5498H41.4792Z"
                  fill="white"
                />
                <path
                  d="M11.1807 19.0449H31.3743L11.1891 54.0465L1.08398 36.5499L11.1807 19.0449Z"
                  fill="white"
                />
              </svg>
              <svg
                version="1.1"
                id="cardfront"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 750 471"
                style={{ enableBackground: "new 0 0 750 471" } as any}
                xmlSpace="preserve"
              >
                <g id="Front">
                  <g id="CardBackground">
                    <g id="Page-1_1_">
                      <g id="amex_1_">
                        <path
                          id="Rectangle-1_1_"
                          className="lightcolor red"
                          d="M40,0h670c22.1,0,40,17.9,40,40v391c0,22.1-17.9,40-40,40H40c-22.1,0-40-17.9-40-40V40
                       C0,17.9,17.9,0,40,0z"
                        />
                      </g>
                    </g>
                    <path
                      className="darkcolor black"
                      d="M750,431V193.2c-217.6-57.5-556.4-13.5-750,24.9V431c0,22.1,17.9,40,40,40h670C732.1,471,750,453.1,750,431z"
                    />
                  </g>
                  <text
                    transform="matrix(1 0 0 1 60.106 295.0121)"
                    id="svgnumber"
                    className="st2 st3 st4"
                  >
                    {keplrSelectedAddress?.length > 0
                      ? keplrSelectedAddress?.substr(0, 9) +
                        "...." +
                        keplrSelectedAddress?.substr(37, 44)
                      : keplrSelectedAddress}
                  </text>
                  <text
                    transform="matrix(1 0 0 1 65.1054 241.5)"
                    className="st7 st8"
                  >
                    account number
                  </text>
                </g>
                <g id="Back"></g>
              </svg>
            </div>
            <div className="back">
              <div className="ccsingle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  xmlSpace="preserve"
                  width="100%"
                  height="100%"
                  version="1.1"
                  shape-rendering="geometricPrecision"
                  text-rendering="geometricPrecision"
                  image-rendering="optimizeQuality"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  viewBox="0 0 784.37 1277.39"
                >
                  <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer" />
                    <g id="_1421394342400">
                      <g>
                        <polygon
                          fill="#343434"
                          fill-rule="nonzero"
                          points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 "
                        />
                        <polygon
                          fill="#8C8C8C"
                          fill-rule="nonzero"
                          points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33 "
                        />
                        <polygon
                          fill="#3C3C3B"
                          fill-rule="nonzero"
                          points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 "
                        />
                        <polygon
                          fill="#8C8C8C"
                          fill-rule="nonzero"
                          points="392.07,1277.38 392.07,956.52 -0,724.89 "
                        />
                        <polygon
                          fill="#141414"
                          fill-rule="nonzero"
                          points="392.07,882.29 784.13,650.54 392.07,472.33 "
                        />
                        <polygon
                          fill="#393939"
                          fill-rule="nonzero"
                          points="0,650.54 392.07,882.29 392.07,472.33 "
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <svg
                version="1.1"
                id="cardback"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 750 471"
                style={{ enableBackground: "new 0 0 750 471" } as any}
                xmlSpace="preserve"
              >
                <g id="Front">
                  <g id="CardBackground">
                    <g id="Page-1_1_">
                      <g id="amex_1_">
                        <path
                          id="Rectangle-1_1_"
                          className="lightcolor ether"
                          d="M40,0h670c22.1,0,40,17.9,40,40v391c0,22.1-17.9,40-40,40H40c-22.1,0-40-17.9-40-40V40
                       C0,17.9,17.9,0,40,0z"
                        />
                      </g>
                    </g>
                    <path
                      className="white"
                      d="M750,431V193.2c-217.6-57.5-556.4-13.5-750,24.9V431c0,22.1,17.9,40,40,40h670C732.1,471,750,453.1,750,431z"
                    />
                  </g>
                  <text
                    transform="matrix(1 0 0 1 60.106 295.0121)"
                    id="svgnumber"
                    className="st2 st3 st4"
                  >
                    {selectedAddress?.length > 0
                      ? selectedAddress?.substr(0, 7) +
                        "...." +
                        selectedAddress?.substr(33, 42)
                      : selectedAddress}
                  </text>
                  <text
                    transform="matrix(1 0 0 1 65.1054 241.5)"
                    className="st7 st2 st8"
                  >
                    account number
                  </text>
                </g>
                <g id="Back"></g>
              </svg>
            </div>
          </div>
        </div>
        <div className="form-container">
          <div className="field-container">
            <label htmlFor="name">Amount</label>
            <input
              id="name"
              maxLength={"20" as any}
              type="number"
              step="0.000001"
              placeholder="0.000001"
              onChange={(e) => {
                setFunds(e.target.value as any);
              }}
            />
          </div>
          <div className="field-container">
            <label htmlFor="cardnumber">Recieving Address</label>
            <input
              id="recvAddress"
              type="text"
              value={recvAddress.length > 0 ? recvAddress : selectedAddress}
              disabled
            />
            <svg
              id="ccicon"
              className="ccicon"
              width="750"
              height="471"
              viewBox="0 0 750 471"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            ></svg>
          </div>
          <div className="field-container" style={{ marginTop: "20px" }}>
            <a className="myButton akash" id="actionButton">
              Transport
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
