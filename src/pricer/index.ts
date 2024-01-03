/**
 * The pricer standardizes the way we ask for prices from any exchange api
 * the logic for each exchange sits inside an "accountant"
 * the accountant is aware of how to ask an external API for pricing info
 * then standardizes that pricing info for the pricer.
 */
export class Pricer {
  accountant: any;
  constructor(accountant: any) {
    this.accountant = accountant;
  }
  /**
   * Gets the price of the coin from the accountant
   */
  getPrice(ticker: string) {
    return this.accountant.getPrice(ticker);
  }
}
