"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const antd_1 = require("antd");
const { Header, Content, Footer } = antd_1.Layout;
function MainContainer(props) {
    return (react_1.default.createElement(antd_1.Layout, { className: "layout", style: { height: "100%" } },
        react_1.default.createElement(antd_1.Alert, { style: { textAlign: "center" }, message: "AKASH-TESTNET-6 TO ETHEREUM ROPSTEN", type: "warning" }),
        react_1.default.createElement(Header, null,
            react_1.default.createElement("div", { className: "logo" }),
            react_1.default.createElement(antd_1.Menu, { theme: "dark", mode: "horizontal", defaultSelectedKeys: ["1"] },
                react_1.default.createElement(antd_1.Menu.Item, { key: "1" }, `Bridge`),
                react_1.default.createElement(antd_1.Menu.Item, { key: "2" }, `Explore`))),
        react_1.default.createElement(Content, { style: { padding: "0 50px" } },
            react_1.default.createElement("div", { className: "site-layout-content", style: { height: "100%" } }, props.children)),
        react_1.default.createElement(Footer, { style: { textAlign: "center" } }, "Powered by Akash Network")));
}
exports.default = MainContainer;
