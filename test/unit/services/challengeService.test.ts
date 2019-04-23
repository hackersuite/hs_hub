import * as dotenv from "dotenv";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { Challenge } from "../../../src/db/entity/hub";
import { ChallengeService } from "../../../src/services/challenges";
import { HttpResponseCode } from "../../../src/util/errorHandling";

const testChallenge: Challenge = new Challenge("Test Challenge", "Best Challenge", "Us", "None");
const testChallenge1: Challenge = new Challenge("Test Challenge", "Best Challenge", "Us", "None");

let challengeService: ChallengeService;

beforeAll(async (): Promise<void> => {
  dotenv.config({ path: ".env" });

  await createTestDatabaseConnection([ Challenge ]);
  challengeService = new ChallengeService(getRepository(Challenge));
});

beforeEach(async (): Promise<void> => {
  await reloadTestDatabaseConnection();
});

/**
 * Challenge tests
 */
describe("Challenge service tests", (): void => {
  /**
   * Test finding all challenges
   */
  test("Should ensure all challenges can be found", async (): Promise<void> => {
    // Test setup, store the test challenge
    const challengeRepository: Repository<Challenge> = getRepository(Challenge);
    await challengeRepository.save(testChallenge);
    await challengeRepository.save(testChallenge1);

    // Ensure that we can find all the challenges
    const allChallenges: Challenge[] = await challengeService.getAll();
    expect(allChallenges).toBeDefined();
    expect(allChallenges.length).toBe(2);
  });

  /**
   * Test finding a specific challenges
   */
  test("Should ensure a challenge can be found by id", async (): Promise<void> => {
    // Test setup, store the test challenge
    const challengeRepository: Repository<Challenge> = getRepository(Challenge);
    await challengeRepository.save(testChallenge);
    await challengeRepository.save(testChallenge1);

    // Ensure that we can find a specific challenge
    const challengeWithID: Challenge = await challengeService.findByID(testChallenge.id);
    expect(challengeWithID).toBeDefined();
    expect(challengeWithID.title).toBe(testChallenge.title);
  });
  test("Should ensure error thrown when finding by id", async (): Promise<void> => {
    // Ensure that an error is thrown when we cannot find the challenge
    try {
      await challengeService.findByID(0);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
    }
  });

  /**
   * Test creating an challenge
   */
  test("Should ensure an challenge can be created", async (): Promise<void> => {
    // Test setup, create repositoy
    const challengeRepository: Repository<Challenge> = getRepository(Challenge);

    await challengeService.saveChallenge(testChallenge);

    const foundChallenge: Challenge = await challengeRepository.findOne(testChallenge);
    expect(foundChallenge).toBeDefined();
    expect(foundChallenge.id).toBe(testChallenge.id);
  });

  /**
   * Test deleting an challenge
   */
  test("Should ensure a specific challenge can be deleted", async (): Promise<void> => {
    // Test setup, store the test challenge
    const challengeRepository: Repository<Challenge> = getRepository(Challenge);
    await challengeRepository.save(testChallenge);

    // Test that the challenge can be deleted
    await challengeService.deleteChallengeByID(testChallenge.id);
    const foundChallenge: Challenge = await challengeRepository.findOne(testChallenge);
    expect(foundChallenge).toBeUndefined();
  });
});

afterAll(async (): Promise<void> => {
  await closeTestDatabaseConnection();
});