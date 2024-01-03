"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
chai_1.use(chai_as_promised_1.default);
const base_1 = require("./base");
describe("Base accountant should retrieve list from fixture", () => {
    it("it should throw if no api url is provided ", () => {
        const accountant = new base_1.BaseAccountant();
        chai_1.expect(accountant.getPrice(null)).to.be.rejectedWith("accountant: no api url specified");
    });
    it("check that list is retrieved from ", async () => {
        const accountant = new base_1.BaseAccountant("https://jsonplaceholder.typicode.com/users");
        const [user, ...rest] = await accountant.getPrice(null);
        chai_1.expect(user).to.have.property("id");
    });
});
