import WebSocket from "ws";
import { createLogger } from "./utils";

const log = createLogger("hoprd");

export default (
  apiEndpoint: string,
  apiToken: string | undefined,
  onMessage: (body: string) => void
) => {
  const url = new URL("/api/v2/messages/websocket", apiEndpoint);
  url.protocol = url.protocol === "https:" ? "wss" : "ws";
  if (apiToken) {
    url.search = `?apiToken=${apiToken}`;
  }

  const ws = new WebSocket(url);

  ws.on("open", () => {
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
};
