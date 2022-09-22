import MockedWebSocketServer from "jest-websocket-mock";
import assert from "assert";
import initializeHOPRd from "./hoprd";
import { HOPRD_REQ_SMALL } from "./fixtures";

const HOPRD_API_ENDPOINT = "http://localhost:3003";
const mockedServer = new MockedWebSocketServer(
  "ws://localhost:3003/api/v2/messages/websocket"
);

mockedServer.on("connection", console.log);

describe("HOPRd", function () {
  it("should receive message from HOPRd", function (cb) {
    initializeHOPRd(HOPRD_API_ENDPOINT, undefined, (body) => {
      assert.equal(
        body,
        HOPRD_REQ_SMALL,
        "received HOPRd message does not match what was send"
      );
    });
    mockedServer.send(HOPRD_REQ_SMALL);
  });
});
