import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

import { BaseAccountant as Accountant } from "./base";

describe("Base accountant should retrieve list from fixture", () => {
  it("it should throw if no api url is provided ", () => {
    const accountant = new Accountant();
    expect(accountant.getPrice(null)).to.be.rejectedWith(
      "accountant: no api url specified"
    );
  });

  it("check that list is retrieved from ", async () => {
    const accountant = new Accountant(
      "https://jsonplaceholder.typicode.com/users"
    );
    const [user, ...rest] = await accountant.getPrice(null);
    expect(user).to.have.property("id");
  });
});
