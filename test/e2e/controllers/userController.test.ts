import { Express } from "express";
import { buildApp } from "../../../src/app";
import { User } from "../../../src/db/entity/hub";
import { getConnection } from "typeorm";
import { getUserByEmailFromHub } from "../../../src/util/user/userValidation";
import * as request from "supertest";
import { HttpResponseCode } from "../../../src/util/errorHandling";

let bApp: Express;
let sessionCookie: string;

const testHubUser: User = new User();

testHubUser.name = "Billy Tester II";
testHubUser.email = "billyII@testing-userController.com";
testHubUser.authLevel = 1;

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
   * Test that a user that is not logged in can login
   */
  test("Should check the user can login", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/user/login")
      .send({
        email: testHubUser.email,
        password: "password123"
      });

    expect(response.status).toBe(HttpResponseCode.REDIRECT);
    sessionCookie = response.header["set-cookie"].pop().split(";")[0];
    expect(sessionCookie).not.toBeUndefined();
    expect(sessionCookie).toMatch(/connect.sid=*/);
  });

  /**
   * Test that we get notified if the hub user password is incorrect
   */
  test("Should check we get notified if the hub user password is incorrect", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/user/login")
      .send({
        email: testHubUser.email,
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
  await getConnection("hub").close();
});

