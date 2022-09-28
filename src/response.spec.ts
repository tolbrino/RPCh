import assert from "assert";
import Message from "./message";
import Response from "./response";

const RESPONSE = "response";

describe("test Response class", function () {
  it("should create response", function () {
    const response = new Response("someid", RESPONSE);
    assert.equal(response.id, "someid");
    assert.equal(response.response, RESPONSE);
  });
  it("should create message from response", function () {
    const message = new Response("someid", RESPONSE).toMessage();
    assert.equal(message.id, "someid");
    assert.equal(message.body, `response|${RESPONSE}`);
  });
  it("should create response from message", function () {
    const response = Response.fromMessage(
      new Message("someid", `response|${RESPONSE}`)
    );
    assert.equal(response.response, RESPONSE);
  });
});
