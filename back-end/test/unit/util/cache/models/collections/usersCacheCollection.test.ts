import { Express } from "express";
import { getConnection } from "typeorm";
import { buildApp } from "../../../../../../src/app";
import { User } from "../../../../../../src/db/entity";
import { Cache } from "../../../../../../src/util/cache";
import { UserCached } from "../../../../../../src/util/cache/models/objects/userCached";

const testUser: User = new User();

testUser.name = "Billy Tester";
testUser.email = "billy@testing.com";
testUser.authLevel = 3;
testUser.team = "The Testers";
testUser.repo = "tests.git";

/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express): Promise<void> => {
    // Creating the test user
    testUser.id = (await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([testUser])
      .execute()).identifiers[0].id;

    done();
  });
});

/**
 * Tests for UsersCacheCollection
 */
describe("Users cache collection tests", (): void => {
  /**
   * Testing if a newly created user gets added to cache
   */
  test("Should store a new user", async (): Promise<void> => {
    const { id, name, email, authLevel, team, repo } = testUser;
    const userToCache: UserCached = new UserCached(id, name, email, authLevel, team, repo);
    expect(await Cache.users.getElement(testUser.id)).toBe(undefined);
    Cache.users.storeElement(userToCache);
    expect((await Cache.users.getElement(testUser.id)).id).toBe(testUser.id);
  });

  /**
   * Testing if a user gets removed from the cache
   */
  test("Should remove user from collection", async (): Promise<void> => {
    const { id, name, email, authLevel, team, repo } = testUser;
    const userInCache: UserCached = new UserCached(id, name, email, authLevel, team, repo);
    expect((await Cache.users.getElement(testUser.id)).id).toBe(testUser.id);
    Cache.users.removeElement(userInCache);
    expect(await Cache.users.getElement(testUser.id)).toBe(undefined);
  });

  /**
   * Testing if removing a non-existant user from collection throws an error
   */
  test("Should not throw error when removing non-existant user", async (): Promise<void> => {
    const { id, name, email, authLevel, team, repo } = testUser;
    const userNotInCache: UserCached = new UserCached(id, name, email, authLevel, team, repo);
    expect(await Cache.users.getElement(testUser.id)).toBe(undefined);
    Cache.users.removeElement(userNotInCache);
  });



  /**
   * Testing if a newly created user is imported to cache when syncing collection
   */
  test("Should sync a new user", async (): Promise<void> => {
    await Cache.users.sync();
    const cachedUser: UserCached = await Cache.users.getElement(testUser.id);
    expect(cachedUser).not.toBe(undefined);
    expect(cachedUser.id).toBe(testUser.id);
  });

  /**
   * Testing if expired user gets updated
   */
  test("Should sync expired user", async (): Promise<void> => {
    let cachedUser = await Cache.users.getElement(testUser.id);
    expect(cachedUser.isExpired()).toBeFalsy();
    await new Promise(resolve => setTimeout(resolve, 1001));
    expect(cachedUser.isExpired()).toBeTruthy();
    cachedUser.name = "not the real name";
    expect(cachedUser.name).not.toBe(testUser.name);
    const lastSyncedAt = cachedUser.syncedAt;
    cachedUser = await Cache.users.getElement(testUser.id);
    expect(cachedUser.name).toBe(testUser.name);
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

/**
 * Cleaning up after the tests
 */
afterAll(async (done: jest.DoneCallback): Promise<void> => {
  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: testUser.id })
    .execute();

  done();
});