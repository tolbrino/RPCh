/**
 * Responsible for listening for incoming HOPRd messages and creating new ones.
 */

import WebSocket from "ws";
import fetch from "node-fetch";
import { utils } from "ethers";
import { Segment } from "./segment";
import { createLogger } from "./utils";

const { log, logError } = createLogger("hoprd");

/**
 * Attemps to decode a HOPRd message.
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

/**
 * @param httpURL
 * @returns HOPRd's peerID
 */
export const fetchNodePeerId = async (httpURL: URL): Promise<string> => {
  const url = new URL("/api/v2/account/addresses", httpURL);
  url.search = httpURL.search;

  return fetch(url)
    .then((res) => res.json())
    .then((res) => res.hopr);
};

/**
 * Send a segment to a HOPRd node.
 * @param httpURL
 * @param segment
 * @param destination
 */
export const sendSegmentToExitRelay = async (
  httpURL: URL,
  segment: Segment,
  destination: string
): Promise<void> => {
  const url = new URL("/api/v2/messages", httpURL);
  url.search = httpURL.search;

  await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      body: segment.toString(),
      recipient: destination,
    }),
  });
};

/**
 * Subscribes to the HOPRd endpoint for incoming messages.
 * @param wsURL
 * @param onSegment called everytime a new valid segment is received
 * @returns websocket listener
 */
export const createHOPRdListener = (
  wsURL: URL,
  onSegment: (segment: Segment) => void
): WebSocket => {
  const url = new URL("/api/v2/messages/websocket", wsURL);
  url.search = wsURL.search;
  const ws = new WebSocket(url);

  ws.on("upgrade", () => {
    console.log(
      "HORP RPC Relay is listening for messages coming from HOPRd at",
      wsURL.toString()
    );
  });

  ws.on("message", (data: { toString: () => string }) => {
    const dataStr = data.toString();
    log("received data from HOPRd", dataStr);

    const decodedMessage = decodeIncomingMessage(dataStr);
    if (!decodedMessage) return;

    if (!Segment.isValidSegmentStr(decodedMessage)) {
      log(
        "rejected received data from HOPRd: not a valid segment",
        decodedMessage
      );
      return;
    }

    onSegment(Segment.fromString(decodedMessage));
  });

  return ws;
};
