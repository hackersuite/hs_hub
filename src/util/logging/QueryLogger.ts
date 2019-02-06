import { Logger, QueryRunner } from "typeorm";
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { PlatformTools } from "typeorm/platform/PlatformTools";

export class QueryLogger implements Logger {

  constructor(private options?: LoggerOptions) {}

  protected writeToFile(message: string) {
    if (!(message.endsWith("\n"))) message += "\n";
    const basePath: string = PlatformTools.load("app-root-path").path;
    PlatformTools.appendFileSync(basePath + "/hub.log", message);
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    const message: string = `[INFO]: (${query})`;
    this.writeToFile(message);
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    const message: string = `[ERR]: ${error} (${query})`;
    this.writeToFile(message);
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    const message: string = `[SLOW ~ ${time}]: ${query}`;
    this.writeToFile(message);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    // Not implemented
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): any {
    // Not implemented
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner): any {
    switch (level) {
      case "log":
        this.writeToFile(`[LOG]: ${message}`);
        break;
      case "info":
        this.writeToFile(`[INFO]: ${message}`);
        break;
      case "warn":
        this.writeToFile(`[WARN]: ${message}`);
        break;
    }
  }
}