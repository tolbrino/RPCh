import Debug, { Debugger } from "debug";

export const createLogger = (...args: any[]): Debugger => {
  return Debug(["hopr-rpc-relay", ...args].join(":"));
};
