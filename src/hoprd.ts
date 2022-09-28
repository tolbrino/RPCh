/**
 * Responsible for listening for incoming HOPRd messages and creating new ones.
 */

import WebSocket from "ws";
import fetch from "node-fetch";
import { utils } from "ethers";
import { createLogger, createApiUrl } from "./utils";

const { log, logVerbose } = createLogger("hoprd");

/**
 * Attemps to decode a HOPRd body.
 * @param body
 * @returns decoded message
 */
const decodeIncomingBody = (body: string): string | undefined => {
  try {
    return utils.toUtf8String(
      utils.RLP.decode(new Uint8Array(JSON.parse(`[${body}]`)))[0]
    );
  } catch {
    logVerbose("safely failed to decode body", body);
  }
};

/**
 * @returns HOPRd's peerID
 */
export const fetchPeerId = async (
  apiEndpoint: string,
  apiToken?: string
): Promise<string> => {
  const url = createApiUrl(
    "http",
    apiEndpoint,
    "/api/v2/account/addresses",
    apiToken
  );

  let headers = {
    "Content-Type": "application/json",
    "Accept-Content": "application/json",
  } as any;
  if (apiToken) {
    headers["Authorization"] = "Basic " + btoa(apiToken);
  }

  return fetch(url, { headers })
    .then((res) => res.json())
    .then((res) => res.hopr);
};

/**
 * Send a segment to a HOPRd node.
 */
export const sendMessage = async (
  apiEndpoint: string,
  apiToken: string | undefined,
  message: string,
  destination: string
): Promise<void> => {
  const url = createApiUrl("http", apiEndpoint, "/api/v2/messages", apiToken);

  let headers = {
    "Content-Type": "application/json",
    "Accept-Content": "application/json",
  } as any;
  if (apiToken) {
    headers["Authorization"] = "Basic " + btoa(apiToken);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      body: message,
      recipient: destination,
      path: [],
    }),
  });

  log("send message to HOPRd node", response.status, message, destination);
};

/**
 * Subscribes to the HOPRd endpoint for incoming messages.
 * @param onMessage called everytime a new HOPRd message is received
 * @returns websocket listener
 */
export const createListener = (
  apiEndpoint: string,
  apiToken: string | undefined,
  onMessage: (message: string) => void
): (() => void) => {
  const url = createApiUrl(
    "ws",
    apiEndpoint,
    "/api/v2/messages/websocket",
    apiToken
  );
  const ws = new WebSocket(url);

  ws.on("upgrade", () => {
    console.log(
      "HORP RPC Relay is listening for messages coming from HOPRd at",
      url
    );
  });

  ws.on("message", (data: { toString: () => string }) => {
    const body = data.toString();
    log("received body from HOPRd");

    const message = decodeIncomingBody(body);
    if (!message) return;
    logVerbose("decoded received body", message);

    onMessage(message);
  });

  return () => {
    log("Closing HOPRd listener");
    ws.close();
  };
};
