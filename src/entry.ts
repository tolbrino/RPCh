/**
 * Listens for incoming traffic coming from external services (ex: Wallet).
 */
import http from "http";
import { createLogger } from "./utils";

const log = createLogger("entry");

export default (
  port: number,
  onRPC: (body: string, res: http.ServerResponse) => void
): http.Server => {
  const server = http.createServer((req, res) => {
    req.on("data", (data) => {
      const dataStr = data.toString();
      log("received data from client", dataStr);
      onRPC(dataStr, res);
    });
  });

  server.listen(port, undefined, undefined, () => {
    console.log("HORP RPC Relay entry is listening at port", port);
  });

  return server;
};
