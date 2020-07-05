import { Express } from 'express';
import { buildApp } from '../../src/app';
import { getConnection } from 'typeorm';
import { getTestDatabaseOptions, initEnv } from '../util/testUtils';

/**
 * App startup tests
 */
describe('App startup tests', (): void => {
	/**
   * Setup the env variables for the tests
   */
	beforeAll((): void => {
		initEnv();
	});
	/**
   * Building app with default settings
   */
	test('App should build without errors', async (): Promise<void> => {
		const builtApp = await buildApp(getTestDatabaseOptions(undefined, 'hub'));
		expect(builtApp.get('port')).toBe(process.env.PORT ?? 3000);
		expect(builtApp.get('env')).toBe(process.env.ENVIRONMENT ?? 'production');
		expect(getConnection('hub').isConnected).toBeTruthy();
		await getConnection('hub').close();
	});

	/**
   * Testing dev environment
   */
	test('App should start in dev environment', async (): Promise<void> => {
		process.env.ENVIRONMENT = 'dev';
		const builtApp = await buildApp(getTestDatabaseOptions(undefined, 'hub'));
		expect(builtApp.get('env')).toBe('dev');
		expect(getConnection('hub').isConnected).toBeTruthy();
		await getConnection('hub').close();
	});

	/**
   * Testing production environment
   */
	test('App should start in production environment', async (): Promise<void> => {
		process.env.ENVIRONMENT = 'production';
		const builtApp = await buildApp(getTestDatabaseOptions(undefined, 'hub'));
		expect(builtApp.get('env')).toBe('production');
		expect(builtApp.get('trust proxy')).toBe(1);
		expect(getConnection('hub').isConnected).toBeTruthy();
		await getConnection('hub').close();
	});

	/**
   * Testing error handling with incorrect settings
   */
	test('App should throw error with invalid settings', async (): Promise<void> => {
		process.env.DB_HOST = 'invalidhost';
		await expect(buildApp()).rejects.toThrow();
		expect(getConnection('hub').isConnected).toBeFalsy();
	});
});
