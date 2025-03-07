import {
  deleteAccessToken as deleteAccessTokenDB,
  getAccessToken as getAccessTokenDB,
  saveAccessToken,
} from "../db";
import type { AccessToken, AccessTokenDB, DBInstance } from "../types";
import { createLogger, generateAccessToken } from "../utils";

const log = createLogger(["access-token-service"]);

/**
 * An abstraction layer for access tokens to interact with db.
 * @param db holds all methods to interact with db
 * @param secretKey signs access tokens
 */
export class AccessTokenService {
  constructor(private db: DBInstance, private secretKey: string) {}

  /**
   * Saves a access token in DB
   * @param timeout number
   * @param amount amount
   * @returns Promise<AccessTokenDB >
   */
  public async createAccessToken(ops: {
    timeout: number;
    amount: bigint;
  }): Promise<AccessTokenDB> {
    try {
      log.normal("Creating access token...");
      const now = new Date();
      // this is calculated by adding timeout in milliseconds to the current time
      const expiredAt = new Date(now.valueOf() + ops.timeout);

      const hash = generateAccessToken({
        amount: ops.amount,
        secretKey: this.secretKey,
        expiredAt,
      });

      const query: AccessToken = {
        token: hash,
        expiredAt: expiredAt.toISOString(),
        createdAt: now.toISOString(),
      };

      const queryAccessToken = await saveAccessToken(this.db, query);

      return queryAccessToken;
    } catch (e: any) {
      log.error("Failed to create access token: ", e);
      throw e;
    }
  }

  /**
   * Gets access token object from DB with a specific access token hash
   * @param accessTokenHash string
   * @returns Promise<AccessTokenDB >
   */
  public getAccessToken(accessTokenHash: string): Promise<AccessTokenDB> {
    return getAccessTokenDB(this.db, accessTokenHash);
  }

  /**
   * Deletes access token object from DB with a specific access token hash
   * @param accessTokenHash string
   * @returns Promise<AccessTokenDB >
   */
  public deleteAccessToken(accessTokenHash: string): Promise<AccessTokenDB> {
    return deleteAccessTokenDB(this.db, accessTokenHash);
  }
}
