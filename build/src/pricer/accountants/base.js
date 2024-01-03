"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAccountant = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * An accountant will verify that a coins worth and perform any standardization actions for the pricer
 */
class BaseAccountant {
    /**
     * The apiUrl, can be a string or a function
     */
    apiUrl = "";
    /**
     * A function to return the apiUrl, incase there is some transforming needed
     */
    getApiUrl = (ticker) => {
        return this.apiUrl;
    };
    /**
     * Modifies the data retrieved to hand back a transformed price to the pricer
     */
    parsePrice = (data) => {
        return data;
    };
    /**
     * Get the price from the accountant for an asset with a ticker
     */
    getPrice = async (ticker) => {
        const apiUrl = this.getApiUrl(ticker);
        if (apiUrl.length == 0) {
            throw new Error("accountant: no api url specified");
        }
        const res = await node_fetch_1.default(apiUrl);
        const data = await res.json();
        return this.parsePrice(data);
    };
    constructor(apiUrl) {
        if (apiUrl)
            this.apiUrl = apiUrl;
    }
}
exports.BaseAccountant = BaseAccountant;
