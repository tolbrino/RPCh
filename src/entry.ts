/**
 * Listens for incoming traffic coming from external services (ex: Wallet).
 */
import http, { type ServerResponse } from "http";
import { parse as parseUrl } from "url";
import { createLogger } from "./utils";

const { log, logVerbose } = createLogger("entry");

/**
 * Creates the entry server which accepts RPC requests from clients.
 * @param port port to run entry server on
 * @param onRequest called everytime a new RPC request is received
 * @returns http server
 */
export const createServer = (
  port: number,
  onRequest: (
    body: string,
    responseObj: ServerResponse,
    exitProvider: string,
    exitPeerId?: string
  ) => void
): (() => void) => {
  const server = http.createServer((req, res) => {
    req.on("data", (data) => {
      let exitProvider: string | undefined;
      let exitPeerId: string | undefined;

      // extract any given data provided by url parameters
      try {
        if (!req.url) throw Error("invalid url");
        const query = parseUrl(req.url).query || "";
        const searchParams = new URLSearchParams(query);
        exitProvider = searchParams.get("exit-provider") || undefined;
        exitPeerId = searchParams.get("exit-peerid") || undefined;
      } catch {}

      // if exit-provider is missing, return missing parameter
      if (!exitProvider) {
        log("request rejected, missing exit-provider");
        res.statusCode = 422;
        res.write("Missing parameter 'exit-provider'");
        res.end();
        return;
      }

      const body = data.toString();
      log("request received");
      logVerbose("request received", body, exitProvider, exitPeerId);
      onRequest(body, res, exitProvider, exitPeerId);
    });
  });

  server.listen(port, undefined, undefined, () => {
    log("HORP RPC Relay entry is listening at port", port);
  });

  return () => {
    log("Closing entry server");
    server.close();
  };
};
