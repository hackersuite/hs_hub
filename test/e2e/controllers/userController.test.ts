import { Express } from "express";
import { buildApp } from "../../../src/app";
import { User } from "../../../src/db/entity/hub";
import { ApplicationUser } from "../../../src/db/entity/applications";
import { getConnection, createConnection } from "typeorm";
import { getUserByEmailFromHub } from "../../../src/util/user/userValidation";
import * as request from "supertest";
import { HttpResponseCode } from "../../../src/util/errorHandling";

let bApp: Express;
let sessionCookie: string;

const testHubUser: User = new User();

testHubUser.name = "Billy Tester II";
testHubUser.email = "billyII@testing-userController.com";
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

/**
 * Testing user controller requests
 */
describe("User controller tests", (): void => {
  /**
   * Test that we get notified when the user does not exist in either database
   */
  test("Should check that a non-existent user asked to register", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/user/login")
      .send({
        email: "this.email.doesnt.exist@testing.com",
        password: "password123"
      });
    expect(response.status).toBe(HttpResponseCode.OK);
    expect(response.text).toContain("Incorrect credentials provided.");
  });

  /**
   * Test that we can port the user from the applications to the hub
   */
  test("Should check the user is copied to hub on login", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/user/login")
      .send({
        email: testApplicationUser.email,
        password: "password123"
      });

    expect(response.status).toBe(HttpResponseCode.REDIRECT);
    sessionCookie = response.header["set-cookie"].pop().split(";")[0];
    expect(sessionCookie).not.toBeUndefined();
    expect(sessionCookie).toMatch(/connect.sid=*/);

    const newHubUser: User = await getUserByEmailFromHub(testApplicationUser.email);
    expect(newHubUser).not.toBe(undefined);
    testHubUser.id = newHubUser.id;
  });

  /**
   * Test that we get notified if the hub user password is incorrect
   */
  test("Should check we get notified if the hub user password is incorrect", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/user/login")
      .send({
        email: testApplicationUser.email,
        password: "password1234"
      });

    expect(response.status).toBe(HttpResponseCode.OK);
  });

  /**
   * Test that we can logout after we have logged in
   */
  test("Should check the user is logged out by passport", async (): Promise<void> => {
    let response = await request(bApp)
      .get("/user/logout")
      .set("Cookie", sessionCookie)
      .send();

    expect(response.status).toBe(HttpResponseCode.REDIRECT);

    response = await request(bApp)
      .get("/")
      .set("Cookie", sessionCookie)
      .send();

    expect(response.status).toBe(HttpResponseCode.REDIRECT);
  });

  /**
   * Test that we cannot use methods that require authorization after logging out
   */
  test("Should not log out after already logged out", async (): Promise<void> => {
    const response = await request(bApp)
      .get("/user/logout")
      .set("Cookie", sessionCookie)
      .send();

    expect(response.status).toBe(HttpResponseCode.REDIRECT);
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
    .where("id = :id", { id: testHubUser.id })
    .execute();

  await getConnection("applications")
    .createQueryBuilder()
    .delete()
    .from(ApplicationUser)
    .where("id = :id", { id: testApplicationUser.id })
    .execute();

  await getConnection("hub").close();
  await getConnection("applications").close();
});

