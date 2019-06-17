import { User, AchievementProgress, ReservedHardwareItem, HardwareItem } from "../../../src/db/entity/hub";
import { UserService } from "../../../src/services/users";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection, initEnv } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { HttpResponseCode } from "../../../src/util/errorHandling";
import { mock, reset, instance, when, verify, anything } from "ts-mockito";

const testHubUser: User = new User(
  "Billy Tester II",
  "billyII@testing-validation.com",
  "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=",
  undefined, 1, "TeamCodeHere-",
  ["a64a87ad-df62-47c7-9592-85d71291abf2"]);

let userService: UserService;

let userServiceWithMocks: UserService;
let mockUser: User;
let mockUserRepository: Repository<User>;
class StubUserRepository extends Repository<User> { }

beforeAll(async (done: jest.DoneCallback): Promise<void> => {
  // Setup env variables for password generation
  initEnv();

  await createTestDatabaseConnection([User, AchievementProgress, ReservedHardwareItem, HardwareItem]);
  userService = new UserService(getRepository(User));

  done();
});

beforeEach(async (done: jest.DoneCallback): Promise<void> => {
  await reloadTestDatabaseConnection();

  mockUser = mock(User);
  mockUserRepository = mock(StubUserRepository);
  userServiceWithMocks = new UserService(instance(mockUserRepository));

  done();
});

afterEach((): void => {
  reset(mockUser);
  reset(mockUserRepository);
});

/**
 * User validation tests
 */
describe("User service tests", (): void => {
  /**
   * Test if passwords can be verified correctly
   */
  describe("Test validatePassword", (): void => {
    test("Should ensure a user password is validated when password is correct", async (): Promise<void> => {
      const validTestUser: boolean = await userService.validatePassword("password123", testHubUser.password);
      expect(validTestUser).toBeTruthy();
    });
    test("Should ensure an incorrect password is not verified", async (): Promise<void> => {
      const invalidTestUser: boolean = await userService.validatePassword("randompassword", testHubUser.password);
      expect(invalidTestUser).toBeFalsy();
    });
  });

  /**
   * Test if multiple users can be retrieved
   */
  describe("Test getAllUsers", (): void => {
    test("Should get all users from the database", async (): Promise<void> => {
      const TOTAL_USERS: number = 5;
      const userRepository: Repository<User> = getRepository(User);

      // Add test users to the database
      for (let i = 1; i <= TOTAL_USERS; i++) {
        await userRepository.insert({ ...testHubUser, id: i, email: `test${i}@test.com` });
      }

      const allUsers: User[] = await userService.getAllUsers();
      expect(allUsers.length).toBe(TOTAL_USERS);
    });
  });

  /**
   * Test if the the user exists in the hub
   */
  describe("Test getUserByEmail", (): void => {
    test("Should find the user by email", async (): Promise<void> => {
      // Insert the test user into the database, along with a random user
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);
      await userRepository.save({ ...testHubUser, id: testHubUser.id + 1, email: "another@random.com" });

      // Get the user from the hub using the user service and check it found the correct user
      const hubUser: User = await userService.getUserByEmailFromHub(testHubUser.email);
      expect(hubUser).toEqual(testHubUser);
    });
  });

  describe("Test getUserByIDFromHub", (): void => {
    test("Should find the user by id", async (): Promise<void> => {
      // Insert the test user into the database, along with a random user
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);
      await userRepository.save({ ...testHubUser, id: testHubUser.id + 1, email: "another@random.com" });

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
  });

  /**
   * Test if the user can be validated by email and password
   */
  describe("Test validateUser", (): void => {
    test("Should ensure that a user can be verified", async (): Promise<void> => {
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);
      await userRepository.save({ ...testHubUser, id: testHubUser.id + 1, email: "another@random.com" });

      const hubUser: User = await userService.validateUser(testHubUser.email, "password123");
      expect(hubUser).toBeTruthy();
      expect(hubUser.password).toBeUndefined();
      expect(hubUser.email).toBe(testHubUser.email);
      expect(hubUser.id).toBe(testHubUser.id);
    });
    test("Should check that an invalid user is not validated", async (): Promise<void> => {
      try {
        await userService.validateUser("invalid@test.com", "mypassword");
      } catch (e) {
        expect(e).toBeDefined();
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }
    });
  });

  /**
   * Test that push ids are assigned to users
   */
  describe("Test getPushIDFromUserID", (): void => {
    test("Should ensure that push ids can be found", async (): Promise<void> => {
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);

      const userPushIds: string[] = await userService.getPushIDFromUserID([testHubUser.id]);
      expect(userPushIds.length).toBe(1);
      expect(userPushIds[0]).toBe(testHubUser.pushId[0]);
    });
    test("Should ensure that push id is added to user", async (): Promise<void> => {
      const testPushID: string = "abc";
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);

      await userService.addPushIDToUser(testHubUser, testPushID);

      const modifiedUser: User = await userRepository.findOne({ id: testHubUser.id });
      expect(modifiedUser.pushId.length).toBe(2);
      expect(modifiedUser.pushId[1]).toBe(testPushID);
    });
    test("Should ensure that first push id is added to user", async (): Promise<void> => {
      const testPushID: string = "abc";
      const userRepository: Repository<User> = getRepository(User);
      testHubUser.pushId = undefined;
      await userRepository.save(testHubUser);

      await userService.addPushIDToUser(testHubUser, testPushID);

      const modifiedUser: User = await userRepository.findOne({ id: testHubUser.id });
      expect(modifiedUser.pushId.length).toBe(1);
      expect(modifiedUser.pushId[0]).toBe(testPushID);
    });
  });


  /**
   * Should test that new users can be saved
   */
  describe("Test insertNewHubUserToDatabase", (): void => {
    test("Test that a user can be added to the database", async (): Promise<void> => {
      const userRepository: Repository<User> = getRepository(User);

      await userService.insertNewHubUserToDatabase(testHubUser);
      const testUser: User = await userRepository.findOne({ id: testHubUser.id });

      expect(testUser).toBeDefined();
      expect(testUser.id).toEqual(testHubUser.id);
    });
  });

  /**
   * Test that users team can be set and count found
   */
  describe("Test setUserTeamAndCount", (): void => {
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
  });

  /**
   * Test that users team can be set
   */
  describe("Test setUserTeam", (): void => {
    test("Should ensure that a user team can be set", async (): Promise<void> => {
      const newTeamCode: string = "NewTeamAgain-";
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);

      await userService.setUserTeam(testHubUser.id, newTeamCode);
      const newUser: User = await userRepository.findOne({ id: testHubUser.id });
      expect(newUser).toBeDefined();
      expect(newUser.team).toBe(newTeamCode);
    });
  });

  /**
   * Test that all teams and members can be found
   */
  describe("Test getUsersTeamMembers", (): void => {
    test("Should ensure that all users from a specific team can be found", async (): Promise<void> => {
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);
      await userRepository.save({ ...testHubUser, id: testHubUser.id + 1, email: "test@test.com" });

      const teamMembers: User[] = await userService.getUsersTeamMembers(testHubUser.team);
      expect(teamMembers).toBeDefined();
      expect(teamMembers.length).toBe(2);
    });
  });

  /**
   * Test getAllUsersInTeams function
   */
  describe("Test getAllUsersInTeams", (): void => {
    test("Should get all members for all teams", async (): Promise<void> => {
      const userRepository: Repository<User> = getRepository(User);
      await userRepository.save(testHubUser);
      await userRepository.save({ ...testHubUser, id: testHubUser.id + 1, email: "test@test.com", team: "newteamcode" });
      await userRepository.save({ ...testHubUser, id: testHubUser.id + 2, email: "test1@test.com", team: undefined });

      const allUsersInTeams: User[] = await userService.getAllUsersInTeams();
      expect(allUsersInTeams).toBeDefined();
      expect(allUsersInTeams.length).toBe(2);
    });
  });

  describe("Test createUser", (): void => {
    test("Should query the repository to create a user", async (): Promise<void> => {
      when(mockUserRepository.save(instance(mockUser))).thenResolve(instance(mockUser));

      await userServiceWithMocks.create(instance(mockUser));

      verify(mockUserRepository.save(instance(mockUser))).once();
    });

    test("Should throw error when the repository throws", async (): Promise<void> => {
      const mockError: Error = new Error("test error");
      when(mockUserRepository.save(anything())).thenThrow(mockError);

      try {
        expect(
          await userServiceWithMocks.create(instance(mockUser))
        ).toThrow();
      } catch (err) {
        expect(err).toBeDefined();
      }

      verify(mockUserRepository.save(instance(mockUser))).once();
    });
  });
});

afterAll(async (done: jest.DoneCallback): Promise<void> => {
  await closeTestDatabaseConnection();
  done();
});
