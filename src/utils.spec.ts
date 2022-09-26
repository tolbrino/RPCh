import assert from "assert";
import { utils } from "ethers";
import { splitStrByBytes, isExpired } from "./utils";

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

describe("test utility isExpired", function () {
  const timeout = 7e3;
  const now = new Date();
  const fiveSecondsAfter = new Date(now.valueOf() + 5e3);
  const tenSecondsAfter = new Date(now.valueOf() + 10e3);

  it("should return false after 5 seconds", function () {
    assert(!isExpired(timeout, now, fiveSecondsAfter));
  });
  it("should return true after 10 seconds", function () {
    assert(isExpired(timeout, now, tenSecondsAfter));
  });
});
