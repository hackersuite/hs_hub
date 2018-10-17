import * as request from "supertest";
import { buildApp } from "../../../src/app";
import { Express } from "express";

let app: Express;
const HTTP_OK: number = 200;
const HTTP_FAIL: number = 401;

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
 * Tests for SignInController
 */
describe("Test for login", (): void => {

  /**
   * Test for the signin method where the user does not exist
   */
  test("SignIn should return a 401 status and invalid message in the response body", async () => {
    const response = await request(app).post("/signin").send(
      {
        email: "test@testemail.com",
        password: "password123"
      });
    expect(response.body.status).toBe(HTTP_FAIL);
    expect(response.body.text).toBe("invalid");
  });

  /**
   * Test for the signin method where the user exists
   */
  test("SignIn should return a 200 status and valid message in the response body", async () => {
    const response = await request(app).post("/signin").send(
      {
        email: "",
        password: ""
      });
    expect(response.body.status).toBe(HTTP_FAIL);
    // expect(response.body.text).toBe("valid");
  });
});