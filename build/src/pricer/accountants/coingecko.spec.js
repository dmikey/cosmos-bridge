"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const coingecko_1 = require("./coingecko");
describe("Coingecko accountant", () => {
    it("should  return empty price from a bad symbol", async () => {
        const accountant = new coingecko_1.Accountant();
        const { price, symbol } = await accountant.getPrice("foo-bar-123");
        chai_1.expect(price).to.equal(undefined);
        chai_1.expect(symbol).to.equal(undefined);
    });
    it("should ask for a price from an empty data object", async () => {
        const accountant = new coingecko_1.Accountant();
        const { price, symbol } = await accountant.parsePrice(null);
        chai_1.expect(price).to.equal(undefined);
        chai_1.expect(symbol).to.equal(undefined);
    });
    it("should return the price of a coin", async () => {
        const accountant = new coingecko_1.Accountant();
        const { price, symbol } = await accountant.getPrice("akash-network");
        chai_1.expect(price.usd).to.be.a("number");
        chai_1.expect(symbol).to.equal("akt");
    });
});
