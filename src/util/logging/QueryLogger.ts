import { Logger, QueryRunner } from "typeorm";
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { PlatformTools } from "typeorm/platform/PlatformTools";
import { LoggerLevels } from "./LoggerLevelsEnum";

export class QueryLogger implements Logger {

  constructor(private options?: LoggerOptions) {}

  protected writeToFile(message: string, file?: string) {
    if (Number(process.env.ENABLE_LOGGING) === 0) return;
    const fileName: string = file ?? process.env.HUB_LOG_FILE_NAME ?? 'hub.log';

    const basePath: string = PlatformTools.load("app-root-path").path;
    PlatformTools.appendFileSync(basePath + "/" + fileName, message + "\n");
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
  log(level: LoggerLevels, message: any, queryRunner?: QueryRunner): any {
    this.writeToFile(`[${level.toUpperCase()}]: ${message}`);
  }

  hardwareLog(level: LoggerLevels, message: string) {
    this.writeToFile(`[${level.toUpperCase()}]: ${message}`, process.env.HARDWARE_LOG_FILE_NAME);
  }
}