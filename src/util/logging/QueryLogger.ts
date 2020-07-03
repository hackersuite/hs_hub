import { Logger } from 'typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
import { LoggerLevels } from './LoggerLevelsEnum';

export class QueryLogger implements Logger {
	public constructor(private readonly options?: LoggerOptions) {}

	protected writeToFile(message: string, file?: string) {
		if (Number(process.env.ENABLE_LOGGING) === 0) return;
		const fileName: string = file ?? process.env.HUB_LOG_FILE_NAME ?? 'hub.log';

		const basePath: string = PlatformTools.load('app-root-path').path;
		PlatformTools.appendFileSync(`${basePath}/${fileName}`, `${message}\n`);
	}

	public logQuery(query: string): any {
		const message = `[INFO]: (${query})`;
		this.writeToFile(message);
	}

	public logQueryError(error: string, query: string): any {
		const message = `[ERR]: ${error} (${query})`;
		this.writeToFile(message);
	}

	/**
   * Logs query that is slow.
   */
	public logQuerySlow(time: number, query: string): any {
		const message = `[SLOW ~ ${time}]: ${query}`;
		this.writeToFile(message);
	}

	/**
   * Logs events from the schema build process.
   */
	public logSchemaBuild(): any {
		// Not implemented
	}

	/**
   * Logs events from the migrations run process.
   */
	public logMigration(): any {
		// Not implemented
	}

	/**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
	public log(level: LoggerLevels, message: any): any {
		this.writeToFile(`[${level.toUpperCase()}]: ${String(message)}`);
	}

	public hardwareLog(level: LoggerLevels, message: string) {
		this.writeToFile(`[${level.toUpperCase()}]: ${message}`, process.env.HARDWARE_LOG_FILE_NAME);
	}
}
