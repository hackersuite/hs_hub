import * as request from "supertest";
import { buildApp } from "../../../src/app";
import { Express } from "express";

let app: Express;
const HTTP_OK: number = 200;

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
 * Tests for testController
 */
describe("Test for testController", (): void => {
  /**
   * Test for the index method
   */
  test("Index should return 'hellow'", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(HTTP_OK);
    expect(response.text).toBe("hellow");
  });

  /**
   * Test for the email method
   */
  test("Email should return the email in the query parameters", async () => {
    const response = await request(app).get("/email?email=myEmail");
    expect(response.status).toBe(HTTP_OK);
    expect(response.text).toBe("myEmail");
  });

  /**
   * Test for the name method
   */
  test("Name should return the name in the URL parameters", async () => {
    const response = await request(app).get("/myName");
    expect(response.status).toBe(HTTP_OK);
    expect(response.text).toBe("myName");
  });

  /**
   * Test for the name method
   */
  test("Password should return the password in the request's body", async () => {
    const response = await request(app).post("/password").send({ password: "myPassword" });
    expect(response.status).toBe(HTTP_OK);
    expect(response.text).toBe("myPassword");
  });
});