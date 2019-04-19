import * as dotenv from "dotenv";
import { Team, User, AchievementProgress, ReservedHardwareItem, HardwareItem } from "../../../src/db/entity/hub";
import { TeamService } from "../../../src/services/teams";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { UserService } from "../../../src/services/users";

const TEST_PASSWORD: string = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";

const testHubUser: User = new User();
const testHubUserNoTeam: User = new User();

const testHubTeam: Team = new Team();

testHubUser.name = "Billy Tester II";
testHubUser.email = "billyII@testing-validation.com";
testHubUser.password = TEST_PASSWORD;
testHubUser.authLevel = 1;
testHubUser.team = "TeamCodeHere-";

testHubUserNoTeam.name = "Billy Tester No Team";
testHubUserNoTeam.email = "billyI@testing-validation.com";
testHubUserNoTeam.password = TEST_PASSWORD;
testHubUserNoTeam.authLevel = 0;

testHubTeam.teamCode = testHubUser.team;

let teamService: TeamService;
let userService: UserService;

beforeAll(async (): Promise<void> => {
  dotenv.config({ path: ".env" });

  await createTestDatabaseConnection([ User, AchievementProgress, ReservedHardwareItem, HardwareItem, Team ]);
  userService = new UserService(getRepository(User));
  teamService = new TeamService(getRepository(Team), userService);
});

beforeEach(async (): Promise<void> => {
  await reloadTestDatabaseConnection();
});

/**
 * Team tests
 */
describe("Team service tests", (): void => {
  beforeEach(async (): Promise<void> => {
    const teamRepository: Repository<Team> = getRepository(Team);
    await teamRepository.save(testHubTeam);
  });

  /**
   * Test that a user can join a current team
   */
  test("Should ensure that a user can join a team that exists in the hub database", async (): Promise<void> => {
    // Test setup, store the test user
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUserNoTeam);

    // Add the no-team-user to the test team
    await teamService.createOrAddTeam(testHubUserNoTeam.id, testHubTeam.teamCode);

    // Checks that the required user exists in the team
    const userWithTeam: User = await userService.getUserByIDFromHub(testHubUserNoTeam.id);
    expect(userWithTeam).toBeDefined();
    expect(userWithTeam.team).toBe(testHubTeam.teamCode);
  });
  test("Should ensure that a new team can be created", async (): Promise<void> => {
    // Test setup, store the test user
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUserNoTeam);

    const newTeamCode: string = "qwertyuiop";
    await teamService.createOrAddTeam(testHubUserNoTeam.id, newTeamCode);

    const teamExists: boolean = await teamService.checkTeamExists(newTeamCode);
    expect(teamExists).toBeTruthy();
  });
  test("Should ensure invalid team code is rejected in createOrAddTeam", async (): Promise<void> => {
    const teamRepository: Repository<Team> = getRepository(Team);
    await teamService.createOrAddTeam(1, undefined);
    const undefinedTeam: Team = await teamRepository.findOne({ teamCode: undefined });
    expect(undefinedTeam).toBeUndefined();
  });

  /**
   * Test that createTeam works correctly
   */
  test("Should ensure invalid team code is rejected", async (): Promise<void> => {
    const teamRepository: Repository<Team> = getRepository(Team);
    await teamService.createTeam(undefined);
    const undefinedTeam: Team = await teamRepository.findOne({ teamCode: undefined });
    expect(undefinedTeam).toBeUndefined();
  });

  /**
   * Tests that leave team works correctly
   */
  test("Should ensure a user can leave a team", async (): Promise<void> => {
    // Test setup
    const teamRepository: Repository<Team> = getRepository(Team);
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);
    await userRepository.save({...testHubUser, id: testHubUser.id + 1, email: "test@test.com"});

    // Perform the test
    const returnedValue: boolean = await teamService.leaveTeam(testHubUser.id, testHubUser.team);
    expect(returnedValue).toBeTruthy();

    const modifiedTeam: Team = await teamRepository.findOne({teamCode: testHubTeam.teamCode});
    expect(modifiedTeam).toBeDefined();

    const modifiedUser: User = await userService.getUserByIDFromHub(testHubUser.id);
    expect(modifiedUser.team).toBeNull();
  });
  test("Should ensure a user is removed from team and team deleted", async (): Promise<void> => {
    // Test setup
    const teamRepository: Repository<Team> = getRepository(Team);
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);

    // Perform the test
    const returnedValue: boolean = await teamService.leaveTeam(testHubUser.id, testHubUser.team);
    expect(returnedValue).toBeTruthy();

    const modifiedTeam: Team = await teamRepository.findOne({teamCode: testHubTeam.teamCode});
    expect(modifiedTeam).toBeUndefined();

    const modifiedUser: User = await userService.getUserByIDFromHub(testHubUser.id);
    expect(modifiedUser.team).toBeNull();
  });
  test("Should ensure that a user cannot leave an invalid team", async (): Promise<void> => {
    const returnedValue: boolean = await teamService.leaveTeam(undefined, undefined);
    expect(returnedValue).toBeFalsy();
  });

  /**
   * Test if a user can join a non-existant team
   */
  test("Should ensure that a user cannot join a team that does not exist", async (): Promise<void> => {
    const userJoinedUndefined: boolean = await teamService.joinTeam(testHubUser.id, undefined);
    expect(userJoinedUndefined).toBeFalsy();

    const userJoined: boolean = await teamService.joinTeam(testHubUser.id, "abcde");
    expect(userJoined).toBeFalsy();
  });

  /**
   * Test if a teams repository can be updated
   */
  test("Should ensure that a teams repoisitory can be updated", async (): Promise<void> => {
    const teamRepository: Repository<Team> = getRepository(Team);
    const newRepo: string = "https://github.com/project.git";

    const result: boolean = await teamService.updateTeamRepository(testHubTeam.teamCode, newRepo);
    expect(result).toBeTruthy();

    const updatedTeam: Team = await teamRepository.findOne(testHubTeam.teamCode);
    expect(updatedTeam.repo).toBe(newRepo);
  });
  test("Should not allow to update team when invalid", async (): Promise<void> => {
    const newRepo: string = "https://github.com/project.git";
    const resultInvalidCode: boolean = await teamService.updateTeamRepository("qwertyup0", newRepo);
    expect(resultInvalidCode).toBeFalsy();
  });

  /**
   * Test if a teams table number can be updated
   */
  test("Should ensure that a teams table number can be updated", async (): Promise<void> => {
    const teamRepository: Repository<Team> = getRepository(Team);
    const newTable: number = 100;

    const result: boolean = await teamService.updateTeamTableNumber(testHubTeam.teamCode, 100);
    expect(result).toBeTruthy();

    const updatedTeam: Team = await teamRepository.findOne(testHubTeam.teamCode);
    expect(updatedTeam.tableNumber).toBe(newTable);
  });
  test("Should ensure that a team table not updated when invalid", async (): Promise<void> => {
    const newTable: number = 100;
    const resultInvalidNumber: boolean = await teamService.updateTeamTableNumber("qwertyup0", newTable);
    expect(resultInvalidNumber).toBeFalsy();
  });

  /**
   * Test that a users team members function works
   */
  test("Should check that all the members of a team can be found", async (): Promise<void> => {
    // Check the user does not exist in the team
    const teamMembers: User[] = await teamService.getUsersTeamMembers(testHubTeam.teamCode);
    expect(teamMembers.length).toBe(0);
  });
});

afterAll(async (): Promise<void> => {
  await closeTestDatabaseConnection();
});