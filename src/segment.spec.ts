import assert from "assert";
import { Segment } from "./segment";
import { RPC_REQ_SMALL, PEER_ID_A as ORIGIN, PROVIDER } from "./fixtures";

describe("test segment class", function () {
  it("should create segment", function () {
    const segment = new Segment(
      "someid",
      0,
      1,
      ORIGIN,
      PROVIDER,
      RPC_REQ_SMALL
    );
    assert.equal(segment.msgId, "someid");
    assert.equal(segment.segment_nr, 0);
    assert.equal(segment.nr_of_segments, 1);
    assert.equal(segment.body, RPC_REQ_SMALL);
    assert.equal(segment.origin, ORIGIN);
    assert.equal(segment.provider, PROVIDER);
  });
  it("should create segment from string", function () {
    const segment = Segment.fromString(
      `someid|0|1|${ORIGIN}|${PROVIDER}|${RPC_REQ_SMALL}`
    );
    assert.equal(segment.msgId, "someid");
    assert.equal(segment.segment_nr, 0);
    assert.equal(segment.nr_of_segments, 1);
    assert.equal(segment.body, RPC_REQ_SMALL);
    assert.equal(segment.origin, ORIGIN);
    assert.equal(segment.provider, PROVIDER);
  });
});
