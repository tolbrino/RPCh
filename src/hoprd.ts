/**
 * Responsible for listening for incoming HOPRd messages and creating new ones.
 */

import WebSocket from "ws";
import fetch from "node-fetch";
import { utils } from "ethers";
import { Segment } from "./segment";
import { createLogger, createApiUrl } from "./utils";

const { log, logError } = createLogger("hoprd");

/**
 * Attemps to decode a HOPRd message.
 * @param message
 * @returns decoded message
 */
export const decodeIncomingMessage = (message: string): string | undefined => {
  log("decoding", message);
  try {
    return utils.toUtf8String(
      utils.RLP.decode(new Uint8Array(JSON.parse(`[${message}]`)))[0]
    );
  } catch (error) {
    logError("Error decoding incoming message");
  }
};

/**
 * @returns HOPRd's peerID
 */
export const fetchNodePeerId = async (
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
export const sendSegmentToExitRelay = async (
  apiEndpoint: string,
  apiToken: string | undefined,
  segment: Segment,
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
      body: segment.toString(),
      recipient: destination,
      path: [],
    }),
  });

  log(
    "send message to HOPRd node",
    response.status,
    segment.toString(),
    destination
  );
};

/**
 * Subscribes to the HOPRd endpoint for incoming messages.
 * @param onSegment called everytime a new valid segment is received
 * @returns websocket listener
 */
export const createHOPRdListener = (
  apiEndpoint: string,
  apiToken: string | undefined,
  onSegment: (segment: Segment) => void
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
    const dataStr = data.toString();
    log("received data from HOPRd");

    const decodedMessage = decodeIncomingMessage(dataStr);
    if (!decodedMessage) return;
    log("decoded received data", decodedMessage);

    if (!Segment.isValidSegmentStr(decodedMessage)) {
      log(
        "rejected received data from HOPRd: not a valid segment",
        decodedMessage
      );
      return;
    }

    onSegment(Segment.fromString(decodedMessage));
  });

  return () => ws.close();
};
