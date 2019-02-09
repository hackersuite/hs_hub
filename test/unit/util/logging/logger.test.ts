import * as fs from "fs";
import * as dotenv from "dotenv";

import { PlatformTools } from "typeorm/platform/PlatformTools";
import { QueryLogger, LoggerLevels } from "../../../../src/util/logging/";

beforeAll((done: jest.DoneCallback): void => {
  dotenv.config({ path: ".env" });
  done();
});

/**
 * Query Logger Tests
 */
describe("Logging tests", (): void => {
  /**
   * Test should ensure when a that a hardwareLog is written to a file
   */
  test("Should ensure a hardware log is recorded in a file", async (): Promise<void> => {
    const filePath = PlatformTools.load("app-root-path").path + "/" + process.env.HARDWARE_LOG_FILE_NAME;

    // Create a new instance of the query logger
    const ql: QueryLogger = new QueryLogger();
    ql.hardwareLog(LoggerLevels.LOG, "test-log-message");

    // Check the contents of the created file to contain the message we wrote
    const data: Buffer = fs.readFileSync(filePath);
    expect(data.toString()).toContain("test-log-message");
  });

  /**
   * Test should ensure when a that a log is written to a file
   */
  test("Should ensure that a standard log is written to a file", async (): Promise<void> => {
    const filePath = PlatformTools.load("app-root-path").path + "/" + process.env.HUB_LOG_FILE_NAME;

    // Create a new instance of the query logger
    const ql: QueryLogger = new QueryLogger();
    ql.log(LoggerLevels.LOG, "test-log-message");

    // Check the contents of the created file to contain the message we wrote
    const data: Buffer = fs.readFileSync(filePath);
    expect(data.toString()).toContain("test-log-message");
  });

  /**
   * Test should ensure when a that a log is written to a file, slow and error
   */
  test("Should ensure that slow and error is written to a file", async (): Promise<void> => {
    const filePath = PlatformTools.load("app-root-path").path + "/" + process.env.HUB_LOG_FILE_NAME;

    // Create a new instance of the query logger
    const ql: QueryLogger = new QueryLogger();
    ql.logQueryError("error-test", "SELECT *");
    ql.logQuerySlow(0.5, "SELECT *");

    // Check the contents of the created file to contain the message we wrote
    const data: Buffer = fs.readFileSync(filePath);
    expect(data.toString()).toContain("[ERR]: error-test");

    expect(data.toString()).toContain("[SLOW ~ 0.5]");

  });

});
