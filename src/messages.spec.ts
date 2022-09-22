import assert from "assert";
import { createMessages, joinMessages } from "./messages";
import { RPC_REQ_SMALL, RPC_REQ_LARGE } from "./fixtures";

describe("messages", function () {
  it("should create messages from RPC_REQ_SMALL", function () {
    const messages = createMessages("req", RPC_REQ_SMALL);
    assert.equal(messages.length, 1);
  });
  it("should create messages from RPC_REQ_LARGE", function () {
    const messages = createMessages("req", RPC_REQ_LARGE);
    assert.equal(messages.length, 2);

    const reconstructedMessage = joinMessages(messages);
    assert.equal(reconstructedMessage, RPC_REQ_LARGE);
  });
});
