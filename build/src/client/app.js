"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const main_1 = __importDefault(require("./containers/main"));
const eth_1 = __importDefault(require("./components/eth"));
function App(props) {
    return (react_1.default.createElement(main_1.default, null,
        react_1.default.createElement(eth_1.default, null)));
}
exports.default = App;
