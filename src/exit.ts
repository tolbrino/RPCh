/**
 * Responsible for creating external requests.
 */
import fetch from "node-fetch";
import { Message } from "./message";
import { createLogger } from "./utils";

const { log } = createLogger("exit");

/**
 * Creates a request to the given provider and returns response.
 * @param message Message to send
 * @param provider exiting provider (infure, etc)
 * @returns response from provider
 */
export const sendRpcToProvider = async (
  message: Message,
  provider: string
): Promise<string> => {
  log("sending data to provider", message.body);

  return fetch(provider, {
    method: "POST",
    body: message.body,
  }).then((res) => res.text());
};
