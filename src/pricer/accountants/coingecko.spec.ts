import { expect } from "chai";
import { Accountant } from "./coingecko";

describe("Coingecko accountant", () => {
  it("should  return empty price from a bad symbol", async () => {
    const accountant = new Accountant();
    const { price, symbol } = await accountant.getPrice("foo-bar-123");
    expect(price).to.equal(undefined);
    expect(symbol).to.equal(undefined);
  });
  it("should ask for a price from an empty data object", async () => {
    const accountant = new Accountant();
    const { price, symbol } = await accountant.parsePrice(null);
    expect(price).to.equal(undefined);
    expect(symbol).to.equal(undefined);
  });
  it("should return the price of a coin", async () => {
    const accountant = new Accountant();
    const { price, symbol } = await accountant.getPrice("akash-network");
    expect(price.usd).to.be.a("number");
    expect(symbol).to.equal("akt");
  });
});
