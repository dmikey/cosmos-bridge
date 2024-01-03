"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accountant = void 0;
const base_1 = require("./base");
/**
 * This accountant returns the pricing from coingeko
 */
class Accountant extends base_1.BaseAccountant {
    apiUrl = (ticker) => `https://api.coingecko.com/api/v3/coins/${ticker}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`;
    getApiUrl = (ticker) => {
        return this.apiUrl(ticker);
    };
    parsePrice = (data) => {
        return {
            price: data?.market_data?.current_price,
            symbol: data?.symbol,
        };
    };
}
exports.Accountant = Accountant;
