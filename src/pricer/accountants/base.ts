import fetch from "node-fetch";

/**
 * An accountant will verify that a coins worth and perform any standardization actions for the pricer
 */
export class BaseAccountant {
  /**
   * The apiUrl, can be a string or a function
   */
  apiUrl: string | Function = "";
  /**
   * A function to return the apiUrl, incase there is some transforming needed
   */
  getApiUrl: Function = (ticker?: string) => {
    return this.apiUrl;
  };
  /**
   * Modifies the data retrieved to hand back a transformed price to the pricer
   */
  parsePrice: Function = (data: any) => {
    return data;
  };
  /**
   * Get the price from the accountant for an asset with a ticker
   */
  getPrice: Function = async (ticker?: string) => {
    const apiUrl = this.getApiUrl(ticker);
    if (apiUrl.length == 0) {
      throw new Error("accountant: no api url specified");
    }

    const res: any = await fetch(apiUrl);
    const data: any = await res.json();
    return this.parsePrice(data);
  };
  constructor(apiUrl?: string | Function) {
    if (apiUrl) this.apiUrl = apiUrl;
  }
}
