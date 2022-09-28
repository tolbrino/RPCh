import assert from "assert";
import Message from "./message";
import { RPC_REQ_SMALL, RPC_REQ_LARGE } from "./fixtures";

describe("test Message class", function () {
  it("should create message", function () {
    const message = new Message("someid", RPC_REQ_SMALL);
    assert.equal(message.id, "someid");
    assert.equal(message.body, RPC_REQ_SMALL);
  });
  it("should create segments from large body", function () {
    const segments = new Message("someid", RPC_REQ_LARGE).toSegments();
    assert.equal(segments.length, 4);
  });
  it("should recreate message from segments", function () {
    const segments = new Message("someid", RPC_REQ_LARGE).toSegments();
    const message = Message.fromSegments(segments);
    assert.equal(message.body, RPC_REQ_LARGE);
  });
  it("should recreate message from unordered segments", function () {
    const segments = new Message("someid", RPC_REQ_LARGE)
      .toSegments()
      .reverse();
    const message = Message.fromSegments(segments);
    assert.equal(message.body, RPC_REQ_LARGE);
  });
});
