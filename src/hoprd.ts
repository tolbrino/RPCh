/**
 * Responsible for listening for incoming HOPRd messages and creating new ones.
 */

import WebSocket from "ws";
import { utils } from "ethers";
import { createLogger } from "./utils";

const { log, logError } = createLogger("hoprd");

/**
 * Attemps to decode a HOPRd incoming message.
 * @param message
 * @returns decoded message
 */
export const decodeIncomingMessage = (message: string): string | undefined => {
  try {
    return utils.toUtf8String(
      utils.RLP.decode(new Uint8Array(JSON.parse(`[${message}]`)))[0]
    );
  } catch (error) {
    logError("Error decoding incoming message", error);
  }
};

export default (
  apiEndpoint: string,
  apiToken: string | undefined,
  onMessage: (body: string) => void
): WebSocket => {
  const url = new URL("/api/v2/messages/websocket", apiEndpoint);
  url.protocol = url.protocol === "https:" ? "wss" : "ws";
  if (apiToken) {
    url.search = `?apiToken=${apiToken}`;
  }

  const ws = new WebSocket(url);

  ws.on("upgrade", () => {
    console.log(
      "HORP RPC Relay is listening for messages coming from HOPRd at",
      apiEndpoint
    );
  });

  ws.on("message", (data: { toString: () => string }) => {
    const dataStr = data.toString();
    log("received data from HOPRd", dataStr);
    onMessage(dataStr);
  });

  return ws;
};
