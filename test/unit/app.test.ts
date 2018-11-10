import { Express } from "express";
import { buildApp } from "../../src/app";
import { getConnection } from "typeorm";

/**
 * App startup tests
 */
describe("App startup tests", (): void => {
  /**
   * Building app with default settings
   */
  test("App should build without errors", async (done: jest.DoneCallback): Promise<void> => {
    buildApp(async (builtApp: Express, err: Error): Promise<void> => {
      expect(err).toBe(undefined);
      expect(builtApp.get("port")).toBe(process.env.PORT || 3000);
      expect(builtApp.get("env")).toBe(process.env.ENVIRONMENT || "production");
      expect(getConnection("hub").isConnected).toBeTruthy();
      expect(getConnection("applications").isConnected).toBeTruthy();
      await getConnection("hub").close();
      await getConnection("applications").close();
      done();
    });
  });

  /**
   * Testing dev environment
   */
  test("App should start in dev environment", async (done: jest.DoneCallback): Promise<void> => {
    process.env.ENVIRONMENT = "dev";
    buildApp(async (builtApp: Express, err: Error): Promise<void> => {
      expect(builtApp.get("env")).toBe("dev");
      expect(err).toBe(undefined);
      expect(getConnection("hub").isConnected).toBeTruthy();
      expect(getConnection("applications").isConnected).toBeTruthy();
      await getConnection("hub").close();
      await getConnection("applications").close();
      done();
    });
  });

  /**
   * Testing error handling with incorrect settings
   */
  test("App should throw error with invalid settings", async (done: jest.DoneCallback): Promise<void> => {
    process.env.DB_HOST = "invalidhost";
    process.env.APP_DB_HOST = "invalidhost";
    buildApp(async (builtApp: Express, err: Error): Promise<void> => {
      expect(err).not.toBe(undefined);
      expect(getConnection("hub").isConnected).toBeFalsy();
      expect(getConnection("applications").isConnected).toBeFalsy();
      done();
    });
  });
});