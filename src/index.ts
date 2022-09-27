import startHoprRpcRelay from "./rpc-relay";
import { fetchNodePeerId, sendSegmentToExitRelay } from "./hoprd";
import { sendRpcToProvider } from "./exit";

const {
  ENTRY_PORT: ENTRY_PORT_STR,
  HOPRD_API_ENDPOINT,
  HOPRD_API_TOKEN,
  RESPONSE_TIMEOUT_STR = "10000",
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

startHoprRpcRelay({
  entryPort: ENTRY_PORT,
  apiEndpoint: HOPRD_API_ENDPOINT,
  apiToken: HOPRD_API_TOKEN,
  timeout: RESPONSE_TIMEOUT,
  fetchNodePeerId,
  sendSegmentToExitRelay,
  sendRpcToProvider,
});
