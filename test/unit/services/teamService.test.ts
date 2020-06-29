import { Team, User, AchievementProgress, ReservedHardwareItem, HardwareItem } from '../../../src/db/entity/hub';
import { TeamService } from '../../../src/services/teams';
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection } from '../../util/testUtils';
import { getRepository, Repository } from 'typeorm';
import { UserService } from '../../../src/services/users';
import { HttpResponseCode } from '../../../src/util/errorHandling';

const TEST_PASSWORD = 'pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=';

const testHubUser: User = new User();
const testHubUserNoTeam: User = new User();

const testHubTeam: Team = new Team();

testHubUser.name = 'Billy Tester II';
testHubUser.email = 'billyII@testing-validation.com';
testHubUser.password = TEST_PASSWORD;
testHubUser.authLevel = 1;

testHubUserNoTeam.name = 'Billy Tester No Team';
testHubUserNoTeam.email = 'billyI@testing-validation.com';
testHubUserNoTeam.password = TEST_PASSWORD;
testHubUserNoTeam.authLevel = 0;

let teamService: TeamService;
let userService: UserService;

beforeAll(async (done: jest.DoneCallback): Promise<void> => {
	await createTestDatabaseConnection([User, AchievementProgress, ReservedHardwareItem, HardwareItem, Team]);
	userService = new UserService(getRepository(User));
	teamService = new TeamService(getRepository(Team), userService);

	done();
});

beforeEach(async (done: jest.DoneCallback): Promise<void> => {
	await reloadTestDatabaseConnection();

	done();
});

/**
 * Team tests
 */
describe('Team service tests', (): void => {
	beforeEach(async (done: jest.DoneCallback): Promise<void> => {
		const teamRepository: Repository<Team> = getRepository(Team);
		const userRepository: Repository<User> = getRepository(User);
		await teamRepository.save(testHubTeam);
		testHubUser.team = testHubTeam;

		await userRepository.save(testHubUser);

		done();
	});

	/**
   * Test that createTeam works correctly
   */
	describe('Test createTeam', (): void => {
		test('Should ensure team can be created', async (): Promise<void> => {
			const teamRepository: Repository<Team> = getRepository(Team);
			const newTeam: Team = await teamService.createTeam();
			const foundTeam: Team = await teamRepository.findOne(newTeam.teamCode);
			expect(foundTeam).toBeDefined();
		});
	});

	/**
   * Tests that leave team works correctly
   */
	describe('Test leaveTeam', (): void => {
		test('Should ensure a user can leave a team', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			const userRepository: Repository<User> = getRepository(User);
			await userRepository.save(testHubUser);
			await userRepository.save({ ...testHubUser, id: testHubUser.id + 1, email: 'test@test.com' });

			// Perform the test
			const returnedValue: boolean = await teamService.leaveTeam(testHubUser.id, testHubUser.team);
			expect(returnedValue).toBeTruthy();

			const modifiedTeam: Team = await teamRepository.findOne(testHubTeam.teamCode);
			expect(modifiedTeam).toBeDefined();

			const modifiedUser: User = await userService.getUserByIDFromHub(testHubUser.id);
			expect(modifiedUser.team).toBeNull();
		});
		test('Should ensure a user is removed from team and team deleted', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			const userRepository: Repository<User> = getRepository(User);
			await userRepository.save(testHubUser);

			// Perform the test
			const returnedValue: boolean = await teamService.leaveTeam(testHubUser.id, testHubUser.team);
			expect(returnedValue).toBeTruthy();

			const modifiedTeam: Team = await teamRepository.findOne(testHubTeam.teamCode);
			expect(modifiedTeam).toBeUndefined();

			const modifiedUser: User = await userService.getUserByIDFromHub(testHubUser.id);
			expect(modifiedUser.team).toBeNull();
		});
		test('Should ensure that a user cannot leave an invalid team', async (): Promise<void> => {
			const returnedValue: boolean = await teamService.leaveTeam(undefined, undefined);
			expect(returnedValue).toBeFalsy();
		});
	});

	/**
   * Test if a user can join a non-existant team
   */
	describe('Test joinTeam', (): void => {
		beforeEach(async (done: jest.DoneCallback): Promise<void> => {
			const userRepository: Repository<User> = getRepository(User);
			await userRepository.save(testHubUserNoTeam);
			done();
		});

		test('Should ensure that a user cannot join a team when not exist', async (): Promise<void> => {
			const userJoinedUndefined: boolean = await teamService.joinTeam(testHubUserNoTeam.id, undefined);
			expect(userJoinedUndefined).toBeFalsy();

			const userAfterJoinFailed: User = await userService.getUserByIDFromHub(testHubUserNoTeam.id);
			expect(userAfterJoinFailed.team).toBeFalsy();
		});

		test('Should ensure error thrown when invalid team provided', async (): Promise<void> => {
			try {
				await teamService.joinTeam(testHubUserNoTeam.id, 'invalid');
			} catch (err) {
				expect(err.statusCode).toBe(HttpResponseCode.INTERNAL_ERROR);
			}

			const userAfterJoinFailed: User = await userService.getUserByIDFromHub(testHubUserNoTeam.id);
			expect(userAfterJoinFailed.team).toBeFalsy();
		});

		test('Should ensure that team joined when team exists', async (): Promise<void> => {
			const userJoinedTeam: boolean = await teamService.joinTeam(testHubUserNoTeam.id, testHubTeam);
			expect(userJoinedTeam).toBeTruthy();

			const userAfterJoin: User = await userService.getUserByIDFromHub(testHubUserNoTeam.id);
			expect(userAfterJoin.team).toEqual(testHubTeam);
		});
	});

	/**
   * Test if a teams repository can be updated
   */
	describe('Test updateTeamRepository', (): void => {
		test('Should ensure that a teams repoisitory can be updated', async (): Promise<void> => {
			const teamRepository: Repository<Team> = getRepository(Team);
			const newRepo = 'https://github.com/project.git';

			const result: boolean = await teamService.updateTeamRepository(testHubTeam.teamCode, newRepo);
			expect(result).toBeTruthy();

			const updatedTeam: Team = await teamRepository.findOne(testHubTeam.teamCode);
			expect(updatedTeam.repo).toBe(newRepo);
		});
		test('Should not allow to update team when invalid', async (): Promise<void> => {
			const newRepo = 'https://github.com/project.git';
			const resultInvalidCode: boolean = await teamService.updateTeamRepository('qwertyup0', newRepo);
			expect(resultInvalidCode).toBeFalsy();
		});
	});

	/**
   * Test if a teams table number can be updated
   */
	describe('Test updateTeamTableNumber', (): void => {
		test('Should ensure that a teams table number can be updated', async (): Promise<void> => {
			const teamRepository: Repository<Team> = getRepository(Team);
			const newTable = 100;

			const result: boolean = await teamService.updateTeamTableNumber(testHubTeam.teamCode, 100);
			expect(result).toBeTruthy();

			const updatedTeam: Team = await teamRepository.findOne(testHubTeam.teamCode);
			expect(updatedTeam.tableNumber).toBe(newTable);
		});
		test('Should ensure that a team table not updated when invalid', async (): Promise<void> => {
			const newTable = 100;
			const resultInvalidNumber: boolean = await teamService.updateTeamTableNumber('qwertyup0', newTable);
			expect(resultInvalidNumber).toBeFalsy();
		});
	});

	/**
   * Test if a teams name can be updated
   */
	describe('Test updateTeamName', (): void => {
		test('Should ensure that a teams name can be updated', async (): Promise<void> => {
			const teamRepository: Repository<Team> = getRepository(Team);
			const newName = 'test1';

			const result: boolean = await teamService.updateTeamName(testHubTeam.teamCode, newName);
			expect(result).toBeTruthy();

			const updatedTeam: Team = await teamRepository.findOne({ name: newName });
			expect(updatedTeam.name).toEqual(newName);
		});
		test('Should ensure that a team name not updated when invalid', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			const testTeam: Team = { ...testHubTeam, teamCode: 'id1', name: 'test' };
			await teamRepository.save(testTeam);

			// Run the test
			const resultWhenTeamValid: boolean = await teamService.updateTeamName(testHubUser.team.teamCode, 'test');
			expect(resultWhenTeamValid).toBeFalsy();

			const resultWhenNoTeam: boolean = await teamService.updateTeamName('abcdef', 'test');
			expect(resultWhenNoTeam).toBeFalsy();
		});
		test('Should ensure that a team name not updated when team not found', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			const testTeam: Team = { ...testHubTeam, teamCode: 'id1', name: 'test' };

			// Run the test
		});
	});

	/**
   * Test that a users team members function works
   */
	describe('Test getUsersTeamMembers', (): void => {
		test('Should check that all the members of a team can be found', async (): Promise<void> => {
			// Check the user does not exist in the team
			const teamMembers: User[] = await teamService.getUsersTeamMembers(testHubTeam.teamCode);
			expect(teamMembers.length).toBe(1);
		});
	});

	/**
   * Test that a users team members function works
   */
	describe('Test getTeam', (): void => {
		test('Should check that all the members of a team can be found', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			await teamRepository.save(testHubTeam);

			// Check the user does not exist in the team
			const teamData: Team = await teamService.getTeam(testHubTeam.teamCode);
			expect(teamData).toEqual(testHubTeam);
		});
	});

	/**
   * Test that a users team members function works
   */
	describe('Test checkTeamExists', (): void => {
		test('Should check that a team can be found', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			await teamRepository.save(testHubTeam);

			// Check the team exists
			const doesTeamExist: boolean = await teamService.checkTeamExists(testHubTeam.teamCode);
			expect(doesTeamExist).toBeTruthy();
		});

		test('Should check that a an invalid team not found', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			await teamRepository.save(testHubTeam);

			// Check the team exists
			const doesTeamExist: boolean = await teamService.checkTeamExists('invalid');
			expect(doesTeamExist).toBeFalsy();
		});
	});

	/**
   * Test that it can be determined if a team table is set by the team code
   */
	describe('Test checkTeamTableIsSet', (): void => {
		test('Should check that a team table number is set', async (): Promise<void> => {
			// Test setup
			const teamRepository: Repository<Team> = getRepository(Team);
			await teamRepository.save(testHubTeam);

			// Check the user does not exist in the team
			const isTeamSet: boolean = await teamService.checkTeamTableIsSet(testHubTeam.teamCode);
			expect(isTeamSet).toBeFalsy();

			// Update the team with a table number and store in the database
			testHubTeam.tableNumber = 10;
			await teamRepository.save(testHubTeam);
			const isTeamSetAfterUpdate: boolean = await teamService.checkTeamTableIsSet(testHubTeam.teamCode);
			expect(isTeamSetAfterUpdate).toBeTruthy();
		});
		test('Should check a team table returns false when undefined', async (): Promise<void> => {
			// Check the user does not exist in the team
			const isTeamSet: boolean = await teamService.checkTeamTableIsSet(undefined);
			expect(isTeamSet).toBeFalsy();
		});
	});
});

afterAll(async (done: jest.DoneCallback): Promise<void> => {
	await closeTestDatabaseConnection();
	done();
});
