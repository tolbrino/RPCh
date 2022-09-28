import Debug, { type Debugger } from "debug";
import { utils } from "ethers";

/**
 * Maximum bytes we should be sending
 * within the HOPR network.
 */
export const MAX_BYTES = 250;

/**
 * Sugar fuction for creating consistent loggers.
 * @param args
 * @returns debug logger and error logger
 */
export const createLogger = (
  ...args: any[]
): {
  log: Debugger;
  logVerbose: Debugger;
  logError: Debugger;
} => {
  const log = Debug(["hopr-rpc-relay", ...args].join(":"));
  const logVerbose = log.extend("verbose");
  const logError = log.extend("error");

  return {
    log,
    logVerbose,
    logError,
  };
};

/**
 * Split string by bytes.
 * @param str
 * @param maxBytes
 * @returns splitted string
 */
export const splitStrByBytes = (str: string, maxBytes: number): string[] => {
  let arr = utils.toUtf8Bytes(str);
  const res: string[] = [];

  while (arr.length > 0) {
    const index = arr.length > maxBytes ? maxBytes : arr.length;
    res.push(utils.toUtf8String(arr.slice(0, index)));
    arr = arr.slice(index, arr.length);
  }

  return res;
};

/**
 * Pseudo generate random ID, not used in
 * anything cryptographically important.
 * @disclaimer Not suitable for crypto.
 * @returns id
 */
export const generateRandomId = (): string => {
  return String(Math.floor(Math.random() * 1e6));
};

/**
 * Check whether given time has expired.
 * @returns whether item has expired
 */
export const isExpired = (
  timeout: number,
  now: Date,
  createdAt: Date
): boolean => {
  return createdAt.valueOf() + timeout < now.valueOf();
};

/**
 * Derive the API url from given parameters.
 * @param protocol
 * @param endpoint
 * @param path
 * @param token
 * @returns URL in string
 */
export const createApiUrl = (
  protocol: "http" | "ws",
  endpoint: string,
  path: string,
  token?: string
): string => {
  const url = new URL(path, endpoint);

  if (protocol === "ws") {
    url.protocol = url.protocol === "https:" ? "wss" : "ws";
  }
  if (token) {
    url.search = `?apiToken=${token}`;
  }

  return url.toString();
};
