import { createMessages } from "./messages";
import { RPC_REQ_CHAIN_ID, RPC_REQ_LARGE } from "./fixtures";

describe("messages", function () {
  it("should create messages from RPC_REQ_CHAIN_ID", function () {
    const messages = createMessages("req", RPC_REQ_CHAIN_ID);
    console.log(messages);
  });
  it("should create messages from RPC_REQ_LARGE", function () {
    const messages = createMessages("req", RPC_REQ_LARGE);
    console.log(messages);
  });
});
