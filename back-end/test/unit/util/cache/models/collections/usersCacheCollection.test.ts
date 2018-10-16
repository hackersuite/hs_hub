import { Express } from "express";
import { getConnection } from "typeorm";
import { buildApp } from "../../../../../../src/app";
import { User } from "../../../../../../src/db/entity";
import { Cache } from "../../../../../../src/util/cache";
import { UserCached } from "../../../../../../src/util/cache/models/objects/userCached";

let app: Express;
const testUser: User = new User();

testUser.name = "Billy Tester";
testUser.email = "billy@testing.com";
testUser.authLevel = 3;
testUser.team = "The Testers";
testUser.repo = "tests.git";

/**
 * Building the app before running tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp((builtApp: Express): void => {
    app = builtApp;
    done();
  });
});

/**
 * Tests for UsersCacheCollection
 */
describe("Users cache collection tests", (): void => {
  /**
   * Testing if a newly created user is imported to cache
   */
  test("Should sync a new user", async (): Promise<void> => {
    testUser.id = (await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([testUser])
      .execute()).identifiers[0].id;

    await Cache.users.sync();
    const cachedUser: UserCached = await Cache.users.getElement(testUser.id);
    expect(cachedUser).not.toBe(undefined);
    expect(cachedUser.id).toBe(testUser.id);
  });

  /**
   * Testing if expired user gets updated
   */
  test("Should update expired user", async (): Promise<void> => {
    let cachedUser = await Cache.users.getElement(testUser.id);
    expect(cachedUser.isExpired()).toBeFalsy();
    await new Promise(resolve => setTimeout(resolve, 1001));
    expect(cachedUser.isExpired()).toBeTruthy();
    const lastSyncedAt = cachedUser.syncedAt;
    cachedUser = await Cache.users.getElement(testUser.id);
    expect(cachedUser.isExpired()).toBeFalsy();
    expect(cachedUser.syncedAt).toBeGreaterThan(lastSyncedAt);
  });

  /**
   * Testing if deleted user gets removed from cache
   */
  test("Should remove deleted user", async (): Promise<void> => {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("id = :id", { id: testUser.id })
      .execute();

    await Cache.users.sync();
    const cachedUser: UserCached = await Cache.users.getElement(testUser.id);

    expect(cachedUser).toBe(undefined);
  });
});