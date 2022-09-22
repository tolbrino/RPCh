import Debug, { type Debugger } from "debug";

export type Message = {
  appId: string;
  msgType: "req" | "res";
  segment_nr: number;
  nr_of_segments: number;
  body: string;
};

export const APP_ID = "rpcrelay";
export const MAX_BYTES = 400;

export const createLogger = (
  ...args: any[]
): {
  log: Debugger;
  logError: Debugger;
} => {
  const log = Debug(["hopr-rpc-relay", ...args].join(":"));
  const logError = log.extend("error");

  return {
    log,
    logError,
  };
};
