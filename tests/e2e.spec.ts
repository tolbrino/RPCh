import type { Segment } from "../src/segment";
import Ganache from "ganache";
import WebSocket from "ws";
import fetch from "node-fetch";
import {
  PEER_ID_A,
  PEER_ID_B,
  RPC_REQ_LARGE,
  RPC_REQ_SMALL,
} from "../src/fixtures";
import startHoprRpcRelay from "../src/rpc-relay";
import { sendRpcToProvider } from "../src/exit";

const createRpcServer = (port: number) => {
  const server = Ganache.server({});
  server.listen(port);
  return server;
};

const createMockEnvironment = async (
  apiPort: number,
  entryPort: number,
  timeout: number,
  peerId: string,
  triggerNewSegment: (segment: Segment) => Promise<void>,
  provider: string
) => {
  const apiEndpoint = `http://localhost:${apiPort}`;
  const wsServer = new WebSocket.Server({ port: apiPort });
  const stopRelay = await startHoprRpcRelay({
    apiEndpoint,
    timeout,
    entryPort,
    fetchNodePeerId: () => Promise.resolve(peerId),
    sendSegmentToExitRelay: (_a, _b, segment) => triggerNewSegment(segment),
    sendRpcToProvider: (message) => sendRpcToProvider(message, provider),
  });

  return {
    apiEndpoint,
    ws: wsServer,
    stopRelay,
  };
};

describe("test hopr-rpc-relay", function () {
  const RPC_PORT = 8080;
  const rpc = createRpcServer(RPC_PORT);

  let alice: Awaited<ReturnType<typeof createMockEnvironment>>;
  let bob: Awaited<ReturnType<typeof createMockEnvironment>>;

  beforeAll(async function () {
    alice = await createMockEnvironment(
      3000,
      3001,
      5e3,
      PEER_ID_A,
      async (segment) => {
        bob.ws.emit("message", segment.toString());
      },
      `http://localhost:${RPC_PORT}`
    );
    bob = await createMockEnvironment(
      4000,
      4001,
      5e3,
      PEER_ID_B,
      async (segment) => {
        alice.ws.emit("message", segment.toString());
      },
      `http://localhost:${RPC_PORT}`
    );
  });

  afterAll(async function () {
    try {
      alice.stopRelay();
    } catch {}
    try {
      alice.ws.close();
    } catch {}
    try {
      bob.stopRelay();
    } catch {}
    try {
      bob.ws.close();
    } catch {}
    try {
      rpc.close();
    } catch {}
  });

  it("should", async function () {
    const response = await fetch("http://localhost:3000", {
      method: "POST",
      body: RPC_REQ_SMALL,
    })
      .then((res) => res.text())
      .catch(console.log);

    console.log(response);
  });
});
