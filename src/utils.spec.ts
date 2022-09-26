import assert from "assert";
import { utils } from "ethers";
import { splitStrByBytes } from "./utils";

describe("test utility splitStrByBytes", function () {
  it("should return 1 string", function () {
    const str = "helloworld";
    assert.equal(utils.toUtf8Bytes(str).byteLength, 10);
    assert.equal(splitStrByBytes(str, 10).length, 1);
  });
  it("should return 3 strings", function () {
    const str = "helloworldhelloworldhelloworld";
    assert.equal(utils.toUtf8Bytes(str).byteLength, 30);
    assert.equal(splitStrByBytes(str, 10).length, 3);
  });
});
