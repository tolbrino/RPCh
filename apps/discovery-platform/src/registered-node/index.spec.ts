import assert from "assert";
import {
  createRegisteredNode,
  getRegisteredNodes,
  getRegisteredNode,
  updateRegisteredNode,
  getEligibleNode,
  getRewardForNode,
  deleteRegisteredNode,
} from ".";
import { DBInstance } from "../db";
import { RegisteredNode } from "../types";
import { MockPgInstanceSingleton } from "@rpch/common/build/internal/db";
import path from "path";
import * as PgMem from "pg-mem";
import { wait } from "@rpch/common/build/fixtures";

const mockNode = (peerId?: string, hasExitNode?: boolean): RegisteredNode => ({
  hasExitNode: hasExitNode ?? true,
  peerId: peerId ?? "peerId",
  chainId: 100,
  hoprdApiEndpoint: "localhost:5000",
  hoprdApiToken: "someToken",
  exitNodePubKey: "somePubKey",
  nativeAddress: "someAddress",
});

describe("test registered node functions", function () {
  let dbInstance: DBInstance;

  beforeAll(async function () {
    const migrationsDirectory = path.join(__dirname, "../../migrations");
    dbInstance = await MockPgInstanceSingleton.getDbInstance(
      PgMem,
      migrationsDirectory
    );
    MockPgInstanceSingleton.getInitialState();
  });

  beforeEach(async function () {
    MockPgInstanceSingleton.getInitialState().restore();
  });

  it("should save registered node", async function () {
    await createRegisteredNode(dbInstance, mockNode());
    const createdNode = await getRegisteredNode(dbInstance, mockNode().peerId);
    assert.equal(createdNode?.id, mockNode().peerId);
  });
  it("should get all registered nodes", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    await createRegisteredNode(dbInstance, mockNode("2"));

    const allNodes = await getRegisteredNodes(dbInstance);

    assert.equal(allNodes.length, 2);
  });
  it("should get all registered nodes except exclude list", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    await createRegisteredNode(dbInstance, mockNode("2"));
    await createRegisteredNode(dbInstance, mockNode("3"));

    const notExcludedNodes = await getRegisteredNodes(dbInstance, {
      excludeList: ["2"],
    });

    assert.equal(notExcludedNodes.length, 2);
    assert.equal(
      notExcludedNodes.findIndex((node) => node.id === "2"),
      -1
    );
  });
  it("should get one registered node", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    await createRegisteredNode(dbInstance, mockNode("2"));

    const node = await getRegisteredNode(dbInstance, "1");

    assert.equal(node?.id, "1");
  });
  it("should update registered node", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    const node = await getRegisteredNode(dbInstance, "1");
    await updateRegisteredNode(dbInstance, {
      ...node,
      status: "READY",
    });
    const updatedNode = await getRegisteredNode(dbInstance, "1");
    assert.equal(updatedNode?.status, "READY");
  });
  it("should delete registered node", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    const node = await getRegisteredNode(dbInstance, "1");
    await deleteRegisteredNode(dbInstance, node.id);
    await expect(getRegisteredNode(dbInstance, node.id)).rejects.toThrowError();
  });
  it("should get all nodes that are not exit nodes", async function () {
    await createRegisteredNode(dbInstance, mockNode("1", false));
    await createRegisteredNode(dbInstance, mockNode("2", true));
    await createRegisteredNode(dbInstance, mockNode("3", false));
    const notExitNodes = await getRegisteredNodes(dbInstance, {
      hasExitNode: false,
    });

    assert.equal(notExitNodes.length, 2);
  });
  it("should get all nodes that are exit nodes", async function () {
    await createRegisteredNode(dbInstance, mockNode("1", false));
    await createRegisteredNode(dbInstance, mockNode("2", true));
    await createRegisteredNode(dbInstance, mockNode("3", true));
    const exitNodes = await getRegisteredNodes(dbInstance, {
      hasExitNode: true,
    });

    assert.equal(exitNodes.length, 2);
  });
  it("should get all fresh nodes", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    const node = await getRegisteredNode(dbInstance, "1");
    await updateRegisteredNode(dbInstance, {
      ...node,
      status: "READY",
    });
    await getRegisteredNode(dbInstance, "1");
    await createRegisteredNode(dbInstance, mockNode("2", true));
    await createRegisteredNode(dbInstance, mockNode("3", true));

    const freshNodes = await getRegisteredNodes(dbInstance, {
      status: "FRESH",
    });

    assert.equal(freshNodes?.length, 2);
  });
  // DISCLAIMER: ACTIVATE THIS WHEN FUNDING IS STABLE
  it.skip("should get eligible node", async function () {
    await createRegisteredNode(dbInstance, mockNode("1", false));
    await createRegisteredNode(dbInstance, mockNode("2", true));
    await createRegisteredNode(dbInstance, mockNode("3", true));

    const queryNode = await getRegisteredNode(dbInstance, "2");

    await updateRegisteredNode(dbInstance, {
      ...queryNode,
      status: "READY",
    });

    const eligibleNode = await getEligibleNode(dbInstance);

    assert.equal(eligibleNode?.id, queryNode?.id);
    assert.equal(eligibleNode?.status, "READY");
  });
  it("should calculate reward for non exit node", async function () {
    const baseQuota = BigInt(1);
    await createRegisteredNode(dbInstance, mockNode("1", false));
    const nonExit = await getRegisteredNode(dbInstance, "1");

    const reward = getRewardForNode(baseQuota, BigInt(1), nonExit);

    assert.equal(reward, baseQuota + BigInt(1));
  });
  it("should calculate reward for exit node", async function () {
    const baseQuota = BigInt(1);
    await createRegisteredNode(dbInstance, mockNode("1", true));
    const nonExit = await getRegisteredNode(dbInstance, "1");

    const reward = getRewardForNode(baseQuota, BigInt(1), nonExit);

    assert.equal(reward, baseQuota + BigInt(1) * BigInt(2));
  });
  it("should keep updated_at updated", async function () {
    await createRegisteredNode(dbInstance, mockNode("1"));
    const node = await getRegisteredNode(dbInstance, "1");
    await wait(1);
    await updateRegisteredNode(dbInstance, {
      ...node,
      status: "READY",
    });
    const updatedNode = await getRegisteredNode(dbInstance, "1");

    expect(new Date(node.updated_at).getTime()).toBeLessThan(
      new Date(updatedNode?.updated_at).getTime()
    );
  });
  it.todo("should get a access token");
});
