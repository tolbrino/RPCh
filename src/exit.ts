/**
 * Responsible for creating external requests.
 */
import fetch from "node-fetch";
import { createLogger } from "./utils";

const { log } = createLogger("exit");

export const sendRPC = async (
  providerUrl: string,
  body: string
): Promise<string> => {
  log("sending data to provider", body);

  return fetch(providerUrl, {
    method: "POST",
    body: body,
  }).then((res) => res.text());
};
