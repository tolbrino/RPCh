import assert from "assert";
import { Message } from "./message";
import {
  RPC_REQ_SMALL,
  RPC_REQ_LARGE,
  PEER_ID_A as ORIGIN,
  PROVIDER,
} from "./fixtures";

describe("test message class", function () {
  it("should create message", function () {
    const message = new Message("someid", ORIGIN, PROVIDER, RPC_REQ_SMALL);
    assert.equal(message.id, "someid");
    assert.equal(message.body, RPC_REQ_SMALL);
    assert.equal(message.origin, ORIGIN);
    assert.equal(message.provider, PROVIDER);
  });
  it("should create message from body", function () {
    const message = Message.fromBody(ORIGIN, PROVIDER, RPC_REQ_SMALL);
    assert.equal(message.body, RPC_REQ_SMALL);
    assert.equal(message.origin, ORIGIN);
    assert.equal(message.provider, PROVIDER);
  });
  it("should create segments from small body", function () {
    const segments = Message.fromBody(
      ORIGIN,
      PROVIDER,
      RPC_REQ_SMALL
    ).toSegments();
    assert.equal(segments.length, 1);
  });
  it("should create segments from large body", function () {
    const segments = Message.fromBody(
      ORIGIN,
      PROVIDER,
      RPC_REQ_LARGE
    ).toSegments();
    assert.equal(segments.length, 2);
  });
  it("should recreate message from segments", function () {
    const segments = Message.fromBody(
      ORIGIN,
      PROVIDER,
      RPC_REQ_LARGE
    ).toSegments();
    const message = Message.fromSegments(segments);
    assert.equal(message.body, RPC_REQ_LARGE);
    assert.equal(message.origin, ORIGIN);
    assert.equal(message.provider, PROVIDER);
  });
  it("should recreate message from unordered segments", function () {
    const segments = Message.fromBody(ORIGIN, PROVIDER, RPC_REQ_LARGE)
      .toSegments()
      .reverse();
    const message = Message.fromSegments(segments);
    assert.equal(message.body, RPC_REQ_LARGE);
    assert.equal(message.origin, ORIGIN);
    assert.equal(message.provider, PROVIDER);
  });
});
