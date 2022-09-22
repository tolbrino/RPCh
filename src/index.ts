import initializeEntryPoint from "./entry";
import initializeHOPRd, { decodeIncomingMessage } from "./hoprd";
import { sendRPC } from "./exit";

const {
  ENTRY_PORT: ENTRY_PORT_STR,
  HOPRD_API_ENDPOINT,
  HOPRD_API_TOKEN,
} = process.env;

// validate environment variables
if (!ENTRY_PORT_STR) {
  throw Error("env variable 'ENTRY_PORT' not found");
}
const ENTRY_PORT = Number(ENTRY_PORT_STR);
if (isNaN(ENTRY_PORT)) {
  throw Error("env variable 'ENTRY_PORT' is not a number");
}
if (!HOPRD_API_ENDPOINT) {
  throw Error("env variable 'HOPRD_API_ENDPOINT' not found");
}

initializeEntryPoint(ENTRY_PORT, (body, res) => {
  sendRPC("https://provider-proxy.hoprnet.workers.dev/xdai_mainnet", body).then(
    (result) => {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.write(result);
      res.end();
    }
  );
});

initializeHOPRd(HOPRD_API_ENDPOINT, HOPRD_API_TOKEN, (body) => {
  console.log("from hopr network", body);
  console.log("from hopr network decoded", decodeIncomingMessage(body));
});
