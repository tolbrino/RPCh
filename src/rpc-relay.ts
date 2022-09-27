import { createEntryServer } from "./entry";
import {
  createHOPRdListener,
  type fetchNodePeerId,
  type sendSegmentToExitRelay,
} from "./hoprd";
import type { sendRpcToProvider } from "./exit";
import { Manager } from "./manager";
import { createLogger } from "./utils";

const { log, logError } = createLogger("");

export default async (ops: {
  entryPort: number;
  apiEndpoint: string;
  apiToken?: string;
  timeout: number;
  fetchNodePeerId: typeof fetchNodePeerId;
  sendSegmentToExitRelay: typeof sendSegmentToExitRelay;
  sendRpcToProvider: typeof sendRpcToProvider;
}): Promise<() => void> => {
  // TODO: retry and fail to start
  const myPeerId = await ops.fetchNodePeerId(ops.apiEndpoint, ops.apiToken);
  log("fetched PeerId", myPeerId);
  const manager = new Manager(
    ops.timeout,
    myPeerId,
    (segment, destination) => {
      return ops.sendSegmentToExitRelay(
        ops.apiEndpoint,
        ops.apiToken,
        segment,
        destination
      );
    },
    (message, provider) => {
      return ops.sendRpcToProvider(message, provider);
    }
  );

  const stopEntryServer = createEntryServer(
    ops.entryPort,
    myPeerId,
    (message, responseObj, exitPeerId) => {
      manager.createRequest(message, responseObj, exitPeerId || "");
    }
  );
  const stopHOPRdListener = createHOPRdListener(
    ops.apiEndpoint,
    ops.apiToken,
    (segment) => {
      manager.onSegmentReceived(segment);
    }
  );

  const interval = setInterval(() => manager.removeExpired(), 1e3);

  return () => {
    clearInterval(interval);
    stopEntryServer();
    stopHOPRdListener();
  };
};
