import { TestController } from "../../../src/controllers";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("TestController", () => {
  it("Index should return 'Hellow'", () => {
    const st: string = "hellow";

    expect(st).to.equal("hello");
  });
});