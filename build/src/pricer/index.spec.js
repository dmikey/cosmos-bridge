"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const base_1 = require("./accountants/base");
const chai_1 = require("chai");
describe("Pricer", () => {
    it("Pricer should ask Accountant to Retrieve data", async () => {
        // create a new mock accountant to test the pricer
        // will return the id of the first user record
        class MockAccountant extends base_1.BaseAccountant {
            apiUrl = (path) => `https://jsonplaceholder.typicode.com/${path}`;
            getApiUrl = (ticker) => this.apiUrl(ticker);
            parsePrice = (data) => data[0].id;
        }
        // hand the pricer the mock accountant for it's requests
        const pricer = new index_1.Pricer(new MockAccountant());
        const price = await pricer.getPrice("users");
        chai_1.expect(price).to.equal(1);
    });
});
