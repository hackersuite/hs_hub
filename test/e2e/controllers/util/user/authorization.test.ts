import { User } from '../../../../../src/db/entity/hub';
import { buildApp } from '../../../../../src/app';
import { getConnection } from 'typeorm';
import request from 'supertest';
import { HttpResponseCode } from '../../../../../src/util/errorHandling';
import { AuthLevels } from '../../../../../src/util/user';
import { Express } from 'express';
import { reloadTestDatabaseConnection, closeTestDatabaseConnection, getTestDatabaseOptions, initEnv } from '../../../../util/testUtils';

let bApp: Express;
let sessionCookie: string;

const testHubUser: User = new User();
testHubUser.name = 'Billy Tester II';
testHubUser.email = 'billyII@testing-authorization.com';
testHubUser.authLevel = AuthLevels.Organizer;
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

	const response = await request(bApp)
		.post('/user/login')
		.send({
			email: testHubUser.email,
			password: 'password123'
		});
	sessionCookie = response.header['set-cookie'].pop().split(';')[0];
	done();
});

/**
 * Testing authorization methods
 */
describe('Authorization tests', (): void => {
	/**
   * Test that an organizer can access all methods
   */
	test('Should allow organizer to access all methods', async (): Promise<void> => {
		let response = await request(bApp)
			.get('/user/checkOrganizer')
			.set('Cookie', sessionCookie)
			.send();
		expect(response.status).toBe(HttpResponseCode.OK);

		response = await request(bApp)
			.get('/user/checkVolunteer')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.OK);

		response = await request(bApp)
			.get('/user/checkAttendee')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.OK);
	});

	/**
   * Test that a volunteer can access all methods except for organizer methods
   */
	test('Should allow volunteer to access all except organizer methods', async (): Promise<void> => {
		await getConnection('hub')
			.createQueryBuilder()
			.update(User)
			.set({ authLevel: AuthLevels.Volunteer })
			.where('id = :id', { id: testHubUser.id })
			.execute();

		let response = await request(bApp)
			.get('/user/checkOrganizer')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.REDIRECT);

		response = await request(bApp)
			.get('/user/checkVolunteer')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.OK);

		response = await request(bApp)
			.get('/user/checkAttendee')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.OK);
	});

	/**
   * Test that an attendee can only access attendee methods
   */
	test('Should allow attendee to access all except organizer methods', async (): Promise<void> => {
		await getConnection('hub')
			.createQueryBuilder()
			.update(User)
			.set({ authLevel: AuthLevels.Attendee })
			.where('id = :id', { id: testHubUser.id })
			.execute();

		let response = await request(bApp)
			.get('/user/checkOrganizer')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.REDIRECT);

		response = await request(bApp)
			.get('/user/checkVolunteer')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.REDIRECT);

		response = await request(bApp)
			.get('/user/checkAttendee')
			.set('Cookie', sessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.OK);
	});

	/**
   * Test that a user with an invalid session token cannot access any methods that require authorization
   */
	test('Should not give access to user with invalid session token', async (): Promise<void> => {
		const invalidSessionCookie = 'invalid_token';
		let response = await request(bApp)
			.get('/user/checkOrganizer')
			.set('Cookie', invalidSessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.REDIRECT);

		response = await request(bApp)
			.get('/user/checkAttendee')
			.set('Cookie', invalidSessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.REDIRECT);

		response = await request(bApp)
			.get('/user/checkVolunteer')
			.set('Cookie', invalidSessionCookie)
			.send();

		expect(response.status).toBe(HttpResponseCode.REDIRECT);
	});
});

/**
 * Cleaning up after the tests
 */
afterAll(async (done: jest.DoneCallback): Promise<void> => {
	await closeTestDatabaseConnection('hub');
	done();
});

