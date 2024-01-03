"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const antd_1 = require("antd");
const { Option } = antd_1.Select;
const { TabPane } = antd_1.Tabs;
const icons_1 = require("@ant-design/icons");
const web3_1 = __importDefault(require("web3"));
const wAKT_json_1 = __importDefault(require("$contracts/wAKT.json"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const denoms_1 = require("../../../banker/monetary/denoms");
const stargate_1 = require("@cosmjs/stargate");
const bech32 = require("bech32");
const decodeAkashAddressEtherBase = (address) => {
    try {
        const { words, prefix } = bech32.decode(address);
        const data = bech32.fromWords(words);
        return "0x" + Buffer.from(data).toString("hex");
    }
    catch (error) {
        return error;
    }
};
function default_1() {
    const [selectedAddress, setSelectedAddress] = react_1.useState("");
    const [keplrToEthAddress, setKeplrToEthAddress] = react_1.useState("");
    const [keplrSelectedAddress, setKeplrSelectedAddress] = react_1.useState("");
    const [fundsToBurn, setFundsToBurn] = react_1.useState(0.000001 * denoms_1.decimals.wakt);
    const [fundsToTransport, setFundsToTransport] = react_1.useState(0.000001 * denoms_1.decimals.uakt);
    const burnWAKT = () => {
        if (window?.ethereum?.selectedAddress.length == 0) {
            antd_1.message.error("MetaMask Wallet is not connected.");
            return;
        }
        const web3 = new web3_1.default(window?.ethereum);
        let myContract = new web3.eth.Contract(wAKT_json_1.default.abi, "0x0977709831e88EF7b186238BcDCc902bE6d11a8E");
        myContract.methods
            .burn(`${fundsToBurn}`, `${keplrToEthAddress}000000000000000000000000`)
            .send({ from: window?.ethereum?.selectedAddress })
            .on("transactionHash", function (hash) {
            antd_1.message.info(`Transaction approved: ${hash}`);
        })
            .on("error", function (error) {
            antd_1.message.error(error.message);
        });
    };
    const connectMetaMask = () => {
        window?.ethereum
            .request({ method: "eth_requestAccounts" })
            .then(async (accounts) => {
            setSelectedAddress(window?.ethereum.selectedAddress);
            antd_1.message.info("MetaMask Wallet connected");
        })
            .catch((error) => {
            if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                antd_1.message.warn("Please connect to Etherum Wallet.");
            }
            else {
                antd_1.message.info(error.message);
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
            const wasAdded = await window?.ethereum?.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: tokenImage, // A string url of the token logo
                    },
                },
            });
            if (!wasAdded) {
                antd_1.message.info("User declined to add wAKT to wallet.");
            }
        }
        catch (error) {
            antd_1.message.error(error.message);
        }
    };
    const addTestNetKeplr = () => {
        if (window?.keplr?.experimentalSuggestChain) {
            try {
                window?.keplr.experimentalSuggestChain({
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
                antd_1.message.info("Akash Chain 6 added to Keplr Wallet");
            }
            catch {
                antd_1.message.error("Failed to suggest the chain");
            }
        }
        else {
            antd_1.message.warn("Update to a later Keplr version");
        }
    };
    const sendKeplrTransaction = () => {
        (async () => {
            // See above.
            const chainId = "akash-testnet-6";
            await window.keplr.enable(chainId);
            const offlineSigner = window.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            const client = await stargate_1.SigningStargateClient.connectWithSigner(`${window.location.origin}/akashnetwork`, offlineSigner);
            const recipient = "akash1g2k9az8fafgnhaxczj2pcf7dxzm96r3w0ea3fv";
            const amount = {
                denom: "uakt",
                amount: `${fundsToTransport}`,
            };
            try {
                const result = await client.sendTokens(accounts[0].address, recipient, [amount], `${selectedAddress}`);
            }
            catch (error) {
                antd_1.message.error(`Akash Transport : ${error.message}`);
            }
        })();
    };
    const connectKeplrWallet = () => {
        const chainId = "akash-testnet-6";
        window.keplr?.enable(chainId).then(async () => {
            const key = await window.keplr?.getKey(chainId);
            setKeplrSelectedAddress(key.bech32Address);
            setKeplrToEthAddress(decodeAkashAddressEtherBase(key.bech32Address));
        });
    };
    react_1.useEffect(() => {
        window?.$(() => {
            window?.ethereum.on("accountsChanged", (accounts) => {
                console.log(accounts);
                setSelectedAddress(window?.ethereum.selectedAddress);
            });
            window?.ethereum.on("chainChanged", (chainId) => {
                console.log(chainId);
            });
            window?.ethereum.on("connect", (chainId) => {
                setSelectedAddress(window?.ethereum.selectedAddress);
            });
            if (window?.ethereum?.isConnected()) {
                setSelectedAddress(window?.ethereum.selectedAddress);
            }
            const getKeplr = () => {
                const chainId = "akash-testnet-6";
                const keplr = window.keplr;
                keplr
                    ? keplr.enable(chainId).then(async () => {
                        const key = await window.keplr?.getKey(chainId);
                        setKeplrSelectedAddress(key.bech32Address);
                        setKeplrToEthAddress(decodeAkashAddressEtherBase(key.bech32Address));
                    })
                    : setTimeout(getKeplr, 100);
            };
            getKeplr();
        });
    });
    const [form] = antd_1.Form.useForm();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(antd_1.PageHeader, { ghost: false, title: "Akashian Bridge", subTitle: "Transport Akash or Unwrap tokens.", extra: [
                react_1.default.createElement(antd_1.Button, { key: "3", type: selectedAddress?.length > 0 ? "primary" : "default", onClick: connectMetaMask }, selectedAddress?.length > 0
                    ? "MetaMask Connected"
                    : "Connect MetaMask"),
                react_1.default.createElement(antd_1.Button, { type: keplrSelectedAddress?.length > 0 ? "primary" : "default", onClick: connectKeplrWallet, key: "2" }, keplrSelectedAddress?.length > 0
                    ? "Keplr Connected"
                    : "Connect Keplr"),
            ] },
            react_1.default.createElement(antd_1.Descriptions, { size: "small", column: 2 },
                react_1.default.createElement(antd_1.Descriptions.Item, { label: "Akash Address" },
                    react_1.default.createElement(antd_1.Space, null,
                        keplrSelectedAddress,
                        keplrSelectedAddress?.length > 0 ? react_1.default.createElement(icons_1.CheckCircleOutlined, null) : "")),
                react_1.default.createElement(antd_1.Descriptions.Item, { label: "Ethereum Address" },
                    react_1.default.createElement(antd_1.Space, null,
                        selectedAddress,
                        selectedAddress?.length > 0 ? react_1.default.createElement(icons_1.CheckCircleOutlined, null) : "")))),
        react_1.default.createElement(antd_1.Tabs, { tabPosition: "left" },
            react_1.default.createElement(TabPane, { tab: react_1.default.createElement("span", null,
                    react_1.default.createElement(icons_1.SwapOutlined, null),
                    "Transport"), key: "1" },
                react_1.default.createElement(antd_1.Row, { gutter: 16 },
                    react_1.default.createElement(antd_1.Col, { span: 24 },
                        react_1.default.createElement(antd_1.Card, { title: "Transport Your Akash" },
                            react_1.default.createElement(antd_1.Form, { layout: "horizontal", form: form },
                                react_1.default.createElement(antd_1.Form.Item, { label: "Amount AKT" },
                                    react_1.default.createElement(antd_1.InputNumber, { style: { width: 200 }, defaultValue: "0.000001", min: "0", step: "0.000001", stringMode: true, onChange: (e) => {
                                            setFundsToTransport(new bignumber_js_1.default(e * denoms_1.decimals.uakt));
                                        } })),
                                react_1.default.createElement(antd_1.Form.Item, { label: "Network" },
                                    react_1.default.createElement(antd_1.Select, { defaultValue: "Ethereum", style: { width: 120 } },
                                        react_1.default.createElement(Option, { value: "Ethereum" }, "Ethereum"))),
                                react_1.default.createElement(antd_1.Form.Item, { label: "Address" },
                                    react_1.default.createElement(antd_1.Input, { style: { width: 400 }, placeholder: selectedAddress })),
                                react_1.default.createElement(antd_1.Form.Item, null,
                                    react_1.default.createElement(antd_1.Button, { onClick: (e) => {
                                            sendKeplrTransaction();
                                            e.preventDefault();
                                        }, type: "primary" }, "Send"))))))),
            react_1.default.createElement(TabPane, { tab: react_1.default.createElement("span", null,
                    react_1.default.createElement(icons_1.RollbackOutlined, null),
                    "Unwrap"), key: "2" },
                react_1.default.createElement(antd_1.Row, { gutter: 16 },
                    react_1.default.createElement(antd_1.Col, { span: 24 },
                        react_1.default.createElement(antd_1.Card, { title: "Burn wAKT to aquire AKT" },
                            react_1.default.createElement(antd_1.Space, null,
                                react_1.default.createElement(antd_1.Form, { layout: "horizontal", form: form },
                                    react_1.default.createElement(antd_1.Form.Item, { label: "Amount wAKT" },
                                        react_1.default.createElement(antd_1.InputNumber, { style: { width: 200 }, defaultValue: "0.000001", min: "0", step: "0.000001", stringMode: true, onChange: (e) => {
                                                setFundsToBurn(Number(e) * denoms_1.decimals.wakt);
                                            } })),
                                    react_1.default.createElement(antd_1.Form.Item, { label: "Ethereum encoded Akash Address" },
                                        react_1.default.createElement(antd_1.Space, null,
                                            react_1.default.createElement(antd_1.Input, { style: { width: 400 }, placeholder: keplrSelectedAddress }),
                                            react_1.default.createElement(icons_1.ArrowRightOutlined, null),
                                            react_1.default.createElement(antd_1.Input, { style: { width: 400 }, defaultValue: keplrToEthAddress, disabled: true }))),
                                    react_1.default.createElement(antd_1.Form.Item, null,
                                        react_1.default.createElement(antd_1.Button, { onClick: (e) => {
                                                e.preventDefault();
                                                burnWAKT();
                                            }, type: "primary", onChange: (e) => {
                                                console.log(e);
                                                if (e?.target?.value) {
                                                    setKeplrSelectedAddress(e?.target?.value);
                                                }
                                            } }, "Burn")))))))),
            react_1.default.createElement(TabPane, { tab: react_1.default.createElement("span", null,
                    react_1.default.createElement(icons_1.SettingFilled, null),
                    " Advance"), key: "3" },
                react_1.default.createElement(antd_1.Row, { gutter: 16 },
                    react_1.default.createElement(antd_1.Col, { span: 16 },
                        react_1.default.createElement(antd_1.Card, { title: "MetaMask Actions", bordered: false },
                            react_1.default.createElement(antd_1.Space, null,
                                react_1.default.createElement(antd_1.Button, { onClick: registerTokenWithMetaMask }, "Register wAKT with MetaMask Wallet"))))),
                react_1.default.createElement(antd_1.Row, { gutter: 16 },
                    react_1.default.createElement(antd_1.Col, { span: 16 },
                        react_1.default.createElement(antd_1.Card, { title: "Keplr Actions", bordered: false },
                            react_1.default.createElement(antd_1.Space, null,
                                react_1.default.createElement(antd_1.Button, { onClick: addTestNetKeplr }, "Register Testnet-6 in Wallet")))))))));
}
exports.default = default_1;
