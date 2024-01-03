import { BaseAccountant } from "./base";

/**
 * This accountant returns the pricing from coingeko
 */
export class Accountant extends BaseAccountant {
  apiUrl: Function = (ticker: string) =>
    `https://api.coingecko.com/api/v3/coins/${ticker}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`;
  getApiUrl: Function = (ticker: string) => {
    return this.apiUrl(ticker);
  };
  parsePrice: Function = (data: any) => {
    return {
      price: data?.market_data?.current_price,
      symbol: data?.symbol,
    };
  };
}
