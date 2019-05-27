import { LocalAchievementsRepository, Achievement, AchievementOptions } from "../../../../src/util/achievements";
import { testAchievementOptions } from "./testAchievementOptions";

let achievementsRepository: LocalAchievementsRepository;
const testAchievements: Achievement[] = [];


beforeAll((): void => {
  let id = 0;
  testAchievementOptions.forEach((options: AchievementOptions) => {
    testAchievements.push(new Achievement(id, options));
    id++;
  });
});

beforeEach((): void => {
  achievementsRepository = new LocalAchievementsRepository(testAchievementOptions);
});

describe("LocalAchievementsRepository tests", (): void => {
  describe("Test getAll", (): void => {
    test("Should ensure that all achievements are returned", async (): Promise<void> => {
      expect(await achievementsRepository.getAll()).toEqual(testAchievements);
    });
  });

  describe("Test findOne", (): void => {
    test("Should ensure that all achievements are found by their ids", async (): Promise<void> => {
      for (let i = 0; i < testAchievements.length; i++) {
        const achievement: Achievement = testAchievements[i];
        expect(await achievementsRepository.findOne(achievement.getId())).toEqual(achievement);
      }
    });
  });
});