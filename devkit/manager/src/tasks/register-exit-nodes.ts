import fetch from "node-fetch";
import { utils as ethersUtils } from "ethers";
import { utils } from "@rpch/common";
import { getAddresses } from "../hoprd";
import { createLogger } from "../utils";

const log = createLogger(["register-exit-nodes"]);

async function registerNode(
  discoveryPlatformEndpoint: string,
  client: string,
  chainId: string,
  hoprdPeerId: string,
  hoprdApiEndpoint: string,
  hoprdApiToken: string,
  exitNodePubKey: string,
  nativeAddress: string
): Promise<void> {
  log.verbose("Registering node", {
    discoveryPlatformEndpoint,
    chainId,
    hoprdPeerId,
    hoprdApiEndpoint,
    hoprdApiToken,
    exitNodePubKey,
    nativeAddress,
  });

  const [url, headers] = utils.createApiUrl(
    "http",
    discoveryPlatformEndpoint,
    "/api/v1/node/register"
  );
  return fetch(url.toString(), {
    method: "POST",
    headers: { ...headers, client },
    body: JSON.stringify({
      hasExitNode: true,
      peerId: hoprdPeerId,
      chainId,
      hoprdApiEndpoint,
      hoprdApiToken,
      exitNodePubKey,
      nativeAddress,
    }),
  }).then((res) => res.json());
}

export default async function main(
  discoveryPlatformEndpoint: string,
  client: string,
  chainId: string,
  hoprdApiEndpoints: string[],
  hoprdApiEndpointsExt: string[],
  hoprdApiTokens: string[],
  exitNodePubKeys: string[]
): Promise<void> {
  log.normal("Registering exit nodes", {
    discoveryPlatformEndpoint,
    chainId,
    hoprdApiEndpoints,
    hoprdApiEndpointsExt,
    hoprdApiTokens,
    exitNodePubKeys,
  });

  if (
    [
      hoprdApiEndpointsExt.length,
      hoprdApiTokens.length,
      exitNodePubKeys.length,
    ].some((length) => length !== hoprdApiEndpoints.length)
  ) {
    throw Error(
      `Lengths of 'hoprdApiEndpoints', 'hoprdApiEndpointsExt', 'hoprdApiTokens', 'exitNodePubKeys' do no match`
    );
  }

  const groups: {
    hoprdApiEndpoint: string;
    hoprdApiEndpointExt: string;
    hoprdApiToken: string;
    exitNodePubKey: string;
    hoprdPeerId: string;
    chainId: string;
  }[] = [];

  // get PeerIds in parallel and fill in groups object
  await Promise.all(
    hoprdApiEndpoints.map(async (hoprdApiEndpoint, index) => {
      const hoprdApiEndpointExt = hoprdApiEndpointsExt[index];
      const hoprdApiToken = hoprdApiTokens[index];
      const exitNodePubKey = exitNodePubKeys[index];
      const hoprdPeerId = await getAddresses(
        hoprdApiEndpoint,
        hoprdApiToken
      ).then((res) => res.hopr);
      groups.push({
        hoprdApiEndpoint,
        hoprdApiEndpointExt,
        hoprdApiToken,
        exitNodePubKey,
        hoprdPeerId,
        chainId,
      });
    })
  );

  for (const nodes of groups) {
    const exitNodeAddress = ethersUtils.computeAddress(nodes.exitNodePubKey);
    await registerNode(
      discoveryPlatformEndpoint,
      client,
      chainId,
      nodes.hoprdPeerId,
      nodes.hoprdApiEndpointExt,
      nodes.hoprdApiToken,
      nodes.exitNodePubKey,
      exitNodeAddress
    );
  }
}
