/**
 * Listens for incoming traffic coming from external services (ex: Wallet).
 */
import http, { type ServerResponse } from "http";
import { parse as parseUrl } from "url";
import { Message } from "./message";
import { createLogger } from "./utils";

const { log } = createLogger("entry");

/**
 * Creates the entry server which accepts RPC requests from clients.
 * @param port port to run entry server on
 * @param myPeerId
 * @param onMessage called everytime a new RPC request is received
 * @returns http server
 */
export const createEntryServer = (
  port: number,
  myPeerId: string,
  onMessage: (
    message: Message,
    responseObj: ServerResponse,
    exitPeerId?: string
  ) => void
): (() => void) => {
  const server = http.createServer((req, res) => {
    req.on("data", (data) => {
      let exitProvider: string | undefined;
      let exitPeerId: string | undefined;

      try {
        if (!req.url) throw Error("invalid url");
        const query = parseUrl(req.url).query || "";
        const searchParams = new URLSearchParams(query);
        exitProvider = searchParams.get("exit-provider") || undefined;
        exitPeerId = searchParams.get("exit-peerid") || undefined;
      } catch {}

      if (!exitProvider) {
        log(
          "rejected received data from client, missing exit-provider",
          exitProvider
        );
        res.statusCode = 400;
        res.write("Invalid Parameters");
        res.end();
        return;
      }

      const body = data.toString();
      log("received data from client", body, exitProvider, exitPeerId);

      onMessage(
        Message.fromBody(myPeerId, exitProvider, body),
        res,
        exitPeerId
      );
    });
  });

  server.listen(port, undefined, undefined, () => {
    console.log("HORP RPC Relay entry is listening at port", port);
  });

  return () => {
    server.close();
  };
};
