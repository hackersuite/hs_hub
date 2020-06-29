import { Express } from 'express';
import { buildApp } from '../../../src/app';
import { User } from '../../../src/db/entity/hub';
import { getConnection } from 'typeorm';
import request from 'supertest';
import { HttpResponseCode } from '../../../src/util/errorHandling';
import { getTestDatabaseOptions, reloadTestDatabaseConnection, closeTestDatabaseConnection, initEnv } from '../../util/testUtils';
import { AuthLevels } from '../../../src/util/user';

let bApp: Express;
let sessionCookie: string;

const testHubUser: User = new User();
testHubUser.name = 'Billy Tester II';
testHubUser.email = 'billyII@testing-userController.com';
testHubUser.authLevel = AuthLevels.Volunteer;
testHubUser.password = 'pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=';

/**
 * Preparing for the tests
 */
beforeAll(async (done: jest.DoneCallback): Promise<void> => {
	initEnv();
	buildApp(async (builtApp: Express, err: Error): Promise<void> => {
		if (err) {
			throw new Error('Failed to setup test');
		} else {
			bApp = builtApp;
			done();
		}
	}, getTestDatabaseOptions(undefined, 'hub'));
});

beforeEach(async (done: jest.DoneCallback): Promise<void> => {
	await reloadTestDatabaseConnection('hub');

	// Creating the test user
	await getConnection('hub').getRepository(User).save(testHubUser);
	done();
});

/**
 * Testing user controller requests
 */
describe('User controller tests', (): void => {
	/**
   * Test that we get notified when the user does not exist in either database
   */
	test('Should check that a non-existent user asked to register', async (): Promise<void> => {
		const response = await request(bApp)
			.post('/user/login')
			.send({
				email: 'this.email.doesnt.exist@testing.com',
				password: 'password123'
			});
		expect(response.status).toBe(HttpResponseCode.BAD_REQUEST);
	});

	/**
   * Test that a user that is not logged in can login
   */
	test('Should check the user can login', async (): Promise<void> => {
		const response = await request(bApp)
			.post('/user/login')
			.send({
				email: testHubUser.email,
				password: 'password123'
			});

		expect(response.status).toBe(HttpResponseCode.REDIRECT);
		sessionCookie = response.header['set-cookie'].pop().split(';')[0];
		expect(sessionCookie).toBeDefined();
		expect(sessionCookie).toMatch(/connect.sid=*/);
	});

	/**
   * Test that we get notified if the hub user password is incorrect
   */
	test('Should check we get notified if the hub user password is incorrect', async (): Promise<void> => {
		const response = await request(bApp)
			.post('/user/login')
			.send({
				email: testHubUser.email,
				password: 'password1234'
			});

		expect(response.status).toBe(HttpResponseCode.BAD_REQUEST);
	});

	/**
   * Test that we can logout after we have logged in
   */
	describe('Logout tests', (): void => {
		beforeEach(async (done: jest.DoneCallback): Promise<void> => {
			const response = await request(bApp)
				.post('/user/login')
				.send({
					email: testHubUser.email,
					password: 'password123'
				});
			sessionCookie = response.header['set-cookie'].pop().split(';')[0];
			done();
		});
		test('Should check the user is logged out by passport', async (): Promise<void> => {
			let response = await request(bApp)
				.get('/user/logout')
				.set('Cookie', sessionCookie)
				.send();
			expect(response.status).toBe(HttpResponseCode.REDIRECT);
			expect(response.header.location).toBe('/login');

			response = await request(bApp)
				.get('/')
				.set('Cookie', sessionCookie)
				.send();

			expect(response.status).toBe(HttpResponseCode.REDIRECT);
			expect(response.header.location).toBe('/login');
		});

		/**
     * Test that we cannot use methods that require authorization after logging out
     */
		test('Should not log out after already logged out', async (): Promise<void> => {
			await request(bApp)
				.get('/user/logout')
				.set('Cookie', sessionCookie)
				.send();

			const response = await request(bApp)
				.get('/user/logout')
				.set('Cookie', sessionCookie)
				.send();

			expect(response.status).toBe(HttpResponseCode.REDIRECT);
			expect(response.header.location).toBe('/login');
		});
	});
});

/**
 * Cleaning up after the tests
 */
afterAll(async (done: jest.DoneCallback): Promise<void> => {
	await closeTestDatabaseConnection('hub');
	done();
});
