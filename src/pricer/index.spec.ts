import { Pricer } from "./index";
import { BaseAccountant } from "./accountants/base";
import { expect } from "chai";

describe("Pricer", () => {
  it("Pricer should ask Accountant to Retrieve data", async () => {
    // create a new mock accountant to test the pricer
    // will return the id of the first user record
    class MockAccountant extends BaseAccountant {
      apiUrl = (path: string) => `https://jsonplaceholder.typicode.com/${path}`;
      getApiUrl = (ticker: string) => this.apiUrl(ticker);
      parsePrice = (data: any) => data[0].id;
    }

    // hand the pricer the mock accountant for it's requests
    const pricer = new Pricer(new MockAccountant());
    const price = await pricer.getPrice("users");
    expect(price).to.equal(1);
  });
});
