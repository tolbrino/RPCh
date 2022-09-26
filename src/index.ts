import { createEntryServer } from "./entry";
import {
  createHOPRdListener,
  fetchNodePeerId,
  sendSegmentToExitRelay,
} from "./hoprd";
import { sendRpcToProvider } from "./exit";
import { Manager } from "./manager";

const {
  ENTRY_PORT: ENTRY_PORT_STR,
  HOPRD_API_ENDPOINT,
  HOPRD_API_TOKEN,
  RESPONSE_TIMEOUT_STR = "5000",
} = process.env;

// validate environment variables
if (!ENTRY_PORT_STR) {
  throw Error("env variable 'ENTRY_PORT' not found");
}
const ENTRY_PORT = Number(ENTRY_PORT_STR);
if (isNaN(ENTRY_PORT)) {
  throw Error("env variable 'ENTRY_PORT' not a number");
}
if (!HOPRD_API_ENDPOINT) {
  throw Error("env variable 'HOPRD_API_ENDPOINT' not found");
}
const RESPONSE_TIMEOUT = Number(RESPONSE_TIMEOUT_STR);
if (isNaN(RESPONSE_TIMEOUT)) {
  throw Error("env variable 'RESPONSE_TIMEOUT' not a number");
}

// create reusable endpoint URLs
const { HOPRD_API_HTTP_URL, HOPRD_API_WS_URL } = ((): {
  HOPRD_API_HTTP_URL: URL;
  HOPRD_API_WS_URL: URL;
} => {
  const httpURL = new URL("/", HOPRD_API_ENDPOINT);
  const wsURL = new URL("/", HOPRD_API_ENDPOINT);
  wsURL.protocol = wsURL.protocol === "https:" ? "wss" : "ws";

  if (HOPRD_API_TOKEN) {
    httpURL.search = `?apiToken=${HOPRD_API_TOKEN}`;
    wsURL.search = `?apiToken=${HOPRD_API_TOKEN}`;
  }

  return {
    HOPRD_API_HTTP_URL: httpURL,
    HOPRD_API_WS_URL: wsURL,
  };
})();

const start = async () => {
  // TODO: retry and fail to start
  const myPeerId = await fetchNodePeerId(HOPRD_API_HTTP_URL);
  const manager = new Manager(
    RESPONSE_TIMEOUT,
    myPeerId,
    (segment, destination) => {
      return sendSegmentToExitRelay(HOPRD_API_HTTP_URL, segment, destination);
    },
    (message, provider) => {
      return sendRpcToProvider(message, provider);
    }
  );

  createEntryServer(
    ENTRY_PORT,
    myPeerId,
    (message, responseObj, exitPeerId) => {
      manager.createRequest(message, responseObj, exitPeerId || "");
    }
  );
  createHOPRdListener(HOPRD_API_WS_URL, (segment) => {
    manager.onReceivedSegment(segment);
  });
};

start();
