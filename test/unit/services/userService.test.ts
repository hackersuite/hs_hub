import * as dotenv from "dotenv";
import { User, AchievementProgress, ReservedHardwareItem, HardwareItem } from "../../../src/db/entity/hub";
import { UserService } from "../../../src/services/users";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { HttpResponseCode } from "../../../src/util/errorHandling";

const testHubUser: User = new User();
testHubUser.name = "Billy Tester II";
testHubUser.email = "billyII@testing-validation.com";
testHubUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testHubUser.authLevel = 1;
testHubUser.team = "TeamCodeHere-";
testHubUser.push_id = ["a64a87ad-df62-47c7-9592-85d71291abf2"];

let userService: UserService;

beforeAll(async (): Promise<void> => {
  dotenv.config({ path: ".env" });

  await createTestDatabaseConnection([ User, AchievementProgress, ReservedHardwareItem, HardwareItem ]);
  userService = new UserService(getRepository(User));
});

beforeEach(async (): Promise<void> => {
  await reloadTestDatabaseConnection();
});

/**
 * User validation tests
 */
describe("User service tests", (): void => {
  /**
   * Test if passwords can be verified correctly
   */
  test("Should ensure a user password is validated when password is correct", async (): Promise<void> => {
    const validTestUser: boolean = await userService.validatePassword("password123", testHubUser.password);
    expect(validTestUser).toBeTruthy();
  });
  test("Should ensure an incorrect password is not verified", async (): Promise<void> => {
    const invalidTestUser: boolean = await userService.validatePassword("randompassword", testHubUser.password);
    expect(invalidTestUser).toBeFalsy();
  });

  /**
   * Test if multiple users can be retrieved
   */
  test("Should get all users from the database", async (): Promise<void> => {
    const TOTAL_USERS: number = 5;
    const userRepository: Repository<User> = getRepository(User);

    // Add test users to the database
    for (let i = 1; i <= TOTAL_USERS; i++) {
      await userRepository.insert({...testHubUser, id: i, email: `test${i}@test.com`});
    }

    const allUsers: User[] = await userService.getAllUsers();
    expect(allUsers.length).toBe(TOTAL_USERS);
  });

  /**
   * Test if the the user exists in the hub
   */
  test("Should find the user by email", async (): Promise<void> => {
    // Insert the test user into the database, along with a random user
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);
    await userRepository.save({...testHubUser, id: testHubUser.id + 1, email: "another@random.com"});

    // Get the user from the hub using the user service and check it found the correct user
    const hubUser: User = await userService.getUserByEmailFromHub(testHubUser.email);
    expect(hubUser).toEqual(testHubUser);
  });
  test("Should find the user by id", async (): Promise<void> => {
    // Insert the test user into the database, along with a random user
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);
    await userRepository.save({...testHubUser, id: testHubUser.id + 1, email: "another@random.com"});

    // Get the user from the hub using the user service and check it found the correct user
    const hubUser: User = await userService.getUserByIDFromHub(testHubUser.id);
    expect(hubUser).toEqual(testHubUser);
  });
  test("Should fail to find invalid user", async (): Promise<void> => {
    try {
      await userService.getUserByIDFromHub(1);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
    }
  });

  /**
   * Test if the user can be validated by email and password
   */
  test("Should ensure that a user can be verified", async (): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);
    await userRepository.save({...testHubUser, id: testHubUser.id + 1, email: "another@random.com"});

    const hubUserValid: boolean = await userService.validateUser(testHubUser.email, "password123");
    expect(hubUserValid).toBeTruthy();
  });
  test("Should check that an invalid user is not validated", async (): Promise<void> => {
    try {
      await userService.validateUser("invalid@test.com", "mypassword");
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
    }
  });

  /**
   * Test that push ids are assigned to users
   */
  test("Should ensure that push ids can be found", async (): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);

    const userPushIds: string[] = await userService.getPushIDFromUserID([testHubUser.id]);
    expect(userPushIds.length).toBe(1);
    expect(userPushIds[0]).toBe(testHubUser.push_id[0]);
  });
  test("Should ensure that push id is added to user", async (): Promise<void> => {
    const testPushID: string = "abc";
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);

    await userService.addPushIDToUser(testHubUser, testPushID);

    const modifiedUser: User = await userRepository.findOne({ id: testHubUser.id });
    expect(modifiedUser.push_id.length).toBe(2);
    expect(modifiedUser.push_id[1]).toBe(testPushID);
  });
  test("Should ensure that first push id is added to user", async (): Promise<void> => {
    const testPushID: string = "abc";
    const userRepository: Repository<User> = getRepository(User);
    testHubUser.push_id = undefined;
    await userRepository.save(testHubUser);

    await userService.addPushIDToUser(testHubUser, testPushID);

    const modifiedUser: User = await userRepository.findOne({ id: testHubUser.id });
    expect(modifiedUser.push_id.length).toBe(1);
    expect(modifiedUser.push_id[0]).toBe(testPushID);
  });


  /**
   * Should test that new users can be saved
   */
  test("Test that a user can be added to the database", async (): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User);

    await userService.insertNewHubUserToDatabase(testHubUser);
    const testUser: User = await userRepository.findOne({ id: testHubUser.id });

    expect(testUser).toBeDefined();
    expect(testUser.id).toEqual(testHubUser.id);
  });

  /**
   * Test that users team can be set
   */
  test("Should ensure that a user can set the team and get the new count", async (): Promise<void> => {
    const newTeamCode: string = "NewTeamCode--";
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);

    const count: number = await userService.setUserTeamAndCount(testHubUser.id, testHubUser.team, newTeamCode);
    expect(count).toBeDefined();
    expect(count).toBe(1);

    const newUser: User = await userRepository.findOne({ id: testHubUser.id });
    expect(newUser).toBeDefined();
    expect(newUser.team).toBe(newTeamCode);
  });
  test("Should ensure that a user team can be set", async (): Promise<void> => {
    const newTeamCode: string = "NewTeamAgain-";
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);

    await userService.setUserTeam(testHubUser.id, newTeamCode);
    const newUser: User = await userRepository.findOne({ id: testHubUser.id });
    expect(newUser).toBeDefined();
    expect(newUser.team).toBe(newTeamCode);
  });
  test("Should ensure that all users from a specific team can be found", async (): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);
    await userRepository.save({...testHubUser, id: testHubUser.id + 1, email: "test@test.com"});

    const teamMembers: User[] = await userService.getUsersTeamMembers(testHubUser.team);
    expect(teamMembers).toBeDefined();
    expect(teamMembers.length).toBe(2);
  });
  test("Should get all members for all teams", async (): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User);
    await userRepository.save(testHubUser);
    await userRepository.save({...testHubUser, id: testHubUser.id + 1, email: "test@test.com", team: "newteamcode"});
    await userRepository.save({...testHubUser, id: testHubUser.id + 2, email: "test1@test.com", team: undefined});

    const allUsersInTeams: User[] = await userService.getAllUsersInTeams();
    expect(allUsersInTeams).toBeDefined();
    expect(allUsersInTeams.length).toBe(2);
  });

});

afterAll(async (): Promise<void> => {
  await closeTestDatabaseConnection();
});
