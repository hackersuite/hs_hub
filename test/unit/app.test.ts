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
	test('App should build without errors', async (done: jest.DoneCallback): Promise<void> => {
		await buildApp(async (builtApp: Express, err: Error): Promise<void> => {
			expect(err).toBe(undefined);
			expect(builtApp.get('port')).toBe(process.env.PORT ?? 3000);
			expect(builtApp.get('env')).toBe(process.env.ENVIRONMENT ?? 'production');
			expect(getConnection('hub').isConnected).toBeTruthy();
			await getConnection('hub').close();
			done();
		}, getTestDatabaseOptions(undefined, 'hub'));
	});

	/**
   * Testing dev environment
   */
	test('App should start in dev environment', async (done: jest.DoneCallback): Promise<void> => {
		process.env.ENVIRONMENT = 'dev';
		await buildApp(async (builtApp: Express, err: Error): Promise<void> => {
			expect(builtApp.get('env')).toBe('dev');
			expect(err).toBe(undefined);
			expect(getConnection('hub').isConnected).toBeTruthy();
			await getConnection('hub').close();
			done();
		}, getTestDatabaseOptions(undefined, 'hub'));
	});

	/**
   * Testing production environment
   */
	test('App should start in production environment', async (done: jest.DoneCallback): Promise<void> => {
		process.env.ENVIRONMENT = 'production';
		await buildApp(async (builtApp: Express, err: Error): Promise<void> => {
			expect(builtApp.get('env')).toBe('production');
			expect(builtApp.get('trust proxy')).toBe(1);
			expect(err).toBe(undefined);
			expect(getConnection('hub').isConnected).toBeTruthy();
			await getConnection('hub').close();
			done();
		}, getTestDatabaseOptions(undefined, 'hub'));
	});

	/**
   * Testing error handling with incorrect settings
   */
	test('App should throw error with invalid settings', async (done: jest.DoneCallback): Promise<void> => {
		process.env.DB_HOST = 'invalidhost';
		await buildApp((builtApp: Express, err: Error): Promise<void> => {
			expect(err).toBeDefined();
			expect(getConnection('hub').isConnected).toBeFalsy();
			done();
			return Promise.resolve();
		});
	});
});
