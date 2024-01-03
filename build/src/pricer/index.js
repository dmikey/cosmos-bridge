"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pricer = void 0;
/**
 * The pricer standardizes the way we ask for prices from any exchange api
 * the logic for each exchange sits inside an "accountant"
 * the accountant is aware of how to ask an external API for pricing info
 * then standardizes that pricing info for the pricer.
 */
class Pricer {
    accountant;
    constructor(accountant) {
        this.accountant = accountant;
    }
    /**
     * Gets the price of the coin from the accountant
     */
    getPrice(ticker) {
        return this.accountant.getPrice(ticker);
    }
}
exports.Pricer = Pricer;
