import { buildApp } from "../../../../src/app";
import { getConnection } from "typeorm";
import { ApplicationUser, User } from "../../../../src/db/entity";
import { Express } from "express";
import { getUserByEmailFromApplications, getUserByEmailFromHub } from "../../../../src/util/user/userValidation";

let bApp: Express;

const HTTP_OK: number = 200;
const HTTP_FAIL: number = 401;

const testHubUser: User = new User();

testHubUser.name = "Billy Tester II";
testHubUser.email = "billyI@testing.com";
testHubUser.authLevel = 1;
testHubUser.team = "The Testers II";
testHubUser.repo = "tests2.git";

const testApplicationUser: ApplicationUser = new ApplicationUser();

testApplicationUser.name = "Billy Tester";
testApplicationUser.email = "billy@testing.com";
testApplicationUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testApplicationUser.last_login = "2018-10-09 18:50:24.000262+00";
testApplicationUser.created_time = "2018-09-24 18:30:00.16251+00";
testApplicationUser.is_organizer = false;
testApplicationUser.is_volunteer = false;
testApplicationUser.is_admin = false;
testApplicationUser.is_hardware_admin = false;
testApplicationUser.is_active = true;
testApplicationUser.is_director = false;
testApplicationUser.email_verified = true;

/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express, err: Error): Promise<void> => {
    if (err) {
      console.error("Could not start server!");
      done();
    } else {
      bApp = builtApp;
      // Creating the test user
      testApplicationUser.id = (await getConnection("applications")
        .createQueryBuilder()
        .insert()
        .into(ApplicationUser)
        .values([testApplicationUser])
        .execute()).identifiers[0].id;
      done();
    }
  });
});


// TODO: tests are needed for other functions in userValidation.ts
/**
 * User validation tests
 */
describe("User validation tests", (): void => {
  /**
   * Test if the the user exists in applications
   */
  test("Should ensure the test user exists in the applications database", async (): Promise<void> => {
    const applicationUser: ApplicationUser = await getUserByEmailFromApplications(testApplicationUser.email);
    expect(applicationUser.id).toBe(testApplicationUser.id);
  });
});

/**
 * Cleaning up after the tests
 */
afterAll(async (done: jest.DoneCallback): Promise<void> => {
  await getConnection("applications")
    .createQueryBuilder()
    .delete()
    .from(ApplicationUser)
    .where("id = :id", { id: testApplicationUser.id })
    .execute();

  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: testApplicationUser.id })
    .execute();

  await getConnection("applications").close();
  await getConnection("hub").close();

  done();
});
