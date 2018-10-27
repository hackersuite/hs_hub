import { Express } from "express";
import { getConnection } from "typeorm";
import { buildApp } from "../../../../../../src/app";
import { User } from "../../../../../../src/db/entity";
import { Cache } from "../../../../../../src/util/cache";
import { UserCached } from "../../../../../../src/util/cache/models/objects/userCached";

const testUserInDatabase: User = new User();

testUserInDatabase.name = "Billy Tester";
testUserInDatabase.email = "billy@testing.com";
testUserInDatabase.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testUserInDatabase.authLevel = 3;
testUserInDatabase.team = "The Testers";
testUserInDatabase.repo = "tests.git";

/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express): Promise<void> => {
    // Creating the test user
    testUserInDatabase.id = (await getConnection("hub")
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([testUserInDatabase])
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
    const userToCache: UserCached = new UserCached(testUserInDatabase);

    expect(await Cache.users.getElement(userToCache.id)).toBe(undefined);
    Cache.users.storeElement(userToCache);

    const userInCache = await Cache.users.getElement(userToCache.id);
    expect(userInCache.isEqualTo(userToCache)).toBeTruthy();
  });

  /**
   * Testing if a user gets removed from the cache
   */
  test("Should remove user from collection", async (): Promise<void> => {
    const userThatShouldBeInCache: UserCached = new UserCached(testUserInDatabase);
    Cache.users.storeElement(userThatShouldBeInCache);
    let userInCache: UserCached = await Cache.users.getElement(userThatShouldBeInCache.id);
    expect(userInCache.isEqualTo(userThatShouldBeInCache)).toBeTruthy();

    Cache.users.removeElement(userInCache.id);
    userInCache = await Cache.users.getElement(userThatShouldBeInCache.id);
    expect(userInCache).toBe(undefined);
  });

  /**
   * Testing if removing a non-existant user from collection throws an error
   */
  test("Should not throw error when removing non-existent user", async (): Promise<void> => {
    const userNotInCache: UserCached = await Cache.users.getElement(testUserInDatabase.id);

    expect(userNotInCache).toBe(undefined);
  });

  /**
   * Testing if user is updated when syncing the collection
   */
  test("Should sync a user when syncing the collection", async (): Promise<void> => {
    const userThatShouldBeInCache: UserCached = new UserCached(testUserInDatabase);
    Cache.users.storeElement(userThatShouldBeInCache);

    const userToCache: UserCached = new UserCached(testUserInDatabase);
    userToCache.name = "Incorrect Name";

    Cache.users.storeElement(userToCache);

    let userInCache: UserCached = await Cache.users.getElement(userToCache.id);
    expect(userInCache.isEqualTo(userThatShouldBeInCache)).toBeFalsy();
    await Cache.users.sync();
    userInCache = await Cache.users.getElement(userToCache.id);

    expect(userInCache.isEqualTo(userThatShouldBeInCache)).toBeTruthy();
  });

  /**
   * Testing if the collection manages to sync multiple users at once
   */
  test("Should manage to sync multiple users", async (): Promise<void> => {
    const secondUser = { ...testUserInDatabase, name: "John Tester", id: testUserInDatabase.id + 1 };
    const secondUserId = (await getConnection("hub")
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([secondUser])
      .execute()).identifiers[0].id;

    await Cache.users.sync();
    const firstUserInDB = new UserCached(testUserInDatabase);
    const secondUserInDB = new UserCached(secondUser);
    const firstUserInCache = await Cache.users.getElement(testUserInDatabase.id);
    const secondUserInCache = await Cache.users.getElement(secondUserId);
    expect(firstUserInCache.isEqualTo(firstUserInDB)).toBeTruthy();
    expect(secondUserInCache.isEqualTo(secondUserInDB)).toBeTruthy();

    await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: secondUserId })
    .execute();
  });

  /**
   * Testing if expired user gets updated
   */
  test("Should sync expired user", async (): Promise<void> => {
    const userThatShouldBeInCache: UserCached = new UserCached(testUserInDatabase);
    let userInCache = await Cache.users.getElement(testUserInDatabase.id);

    expect(userInCache.isExpired()).toBeFalsy();
    userInCache.syncedAt = Date.now() - 9999999;
    expect(userInCache.isExpired()).toBeTruthy();

    userInCache.name = "not the real name";
    expect(userInCache.isEqualTo(userThatShouldBeInCache)).toBeFalsy();

    const lastSyncedAt = userInCache.syncedAt;
    userInCache = await Cache.users.getElement(userInCache.id);

    expect(userInCache.isEqualTo(userThatShouldBeInCache)).toBeTruthy();
    expect(userInCache.isExpired()).toBeFalsy();
    expect(userInCache.syncedAt).toBeGreaterThan(lastSyncedAt);
  });

  /**
   * Testing if deleted user gets removed from cache
   */
  test("Should remove deleted user after syncing collection", async (): Promise<void> => {
    const userThatShouldBeInCache: UserCached = new UserCached(testUserInDatabase);
    Cache.users.storeElement(userThatShouldBeInCache);
    let userInCache: UserCached = await Cache.users.getElement(testUserInDatabase.id);

    expect(userInCache.isEqualTo(userThatShouldBeInCache)).toBeTruthy();

    await getConnection("hub")
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("id = :id", { id: testUserInDatabase.id })
      .execute();

    await Cache.users.sync();
    userInCache = await Cache.users.getElement(testUserInDatabase.id);

    expect(userInCache).toBe(undefined);
  });
});

/**
 * Cleaning up after the tests
 */
afterAll(async (): Promise<void> => {
  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: testUserInDatabase.id })
    .execute();

  // Closing the connection to the database
  await getConnection("hub").close();
  await getConnection("applications").close();
});