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
      expect(getConnection().isConnected).toBeTruthy();
      await getConnection().close();
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
      expect(getConnection().isConnected).toBeTruthy();
      await getConnection().close();
      done();
    });
  });

  /**
   * Testing error handling with incorrect settings
   */
  test("App should throw error with invalid settings", async (done: jest.DoneCallback): Promise<void> => {
    process.env.DB_HOST = "invalid host";
    buildApp(async (builtApp: Express, err: Error): Promise<void> => {
      expect(err).not.toBe(undefined);
      expect(getConnection().isConnected).toBeFalsy();
      done();
    });
  });
});