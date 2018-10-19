import { Express } from "express";
import { buildApp } from "../../../../../../src/app";
import { User } from "../../../../../../src/db/entity";
import { getConnection } from "typeorm";
import { UserCached } from "../../../../../../src/util/cache/models/objects/userCached";

const testUser: User = new User();

testUser.name = "Billy Tester";
testUser.email = "billy@testing.com";
testUser.authLevel = 3;
testUser.team = "The Testers";
testUser.repo = "tests.git";

/**
 * Preparing for the test
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express): Promise<void> => {
    // Creating the test user in the database
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
 * Tests for UserCached
 */
describe("Cached user tests", (): void => {
  /**
   * Testing if newly created user gets cached
   */
  test("Should sync new User", async (): Promise<void> => {
    const cachedUser = new UserCached(
      testUser.id,
      testUser.name,
      testUser.email,
      testUser.authLevel,
      testUser.team,
      testUser.repo
    );
    cachedUser.name = "not the real name";
    expect(cachedUser.name).not.toBe(testUser.name);
    await cachedUser.sync();
    expect(cachedUser.name).toBe(testUser.name);
  });

  /**
   * Testing if the cached user expires
   */
  test("Should expire after 1 second", async (): Promise<void> => {
    const cachedUser = new UserCached(
      testUser.id,
      testUser.name,
      testUser.email,
      testUser.authLevel,
      testUser.team,
      testUser.repo
    );
    await cachedUser.sync();
    expect(cachedUser.isExpired()).toBeFalsy();
    await new Promise(resolve => setTimeout(resolve, 1001));
    expect(cachedUser.isExpired()).toBeTruthy();
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

  // Closing the connection to the database
  getConnection().close();

  done();
});