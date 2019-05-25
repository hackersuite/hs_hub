import { Repository } from "typeorm";
import { AchievementsService, AchievementsProgressService } from "../../../src/services/achievements";
import { Achievement } from "../../../src/util/achievements";
import { mock, instance, when, verify, anything } from "ts-mockito";
import { AchievementProgress, User } from "../../../src/db/entity/hub";

let mockAchievementsService: AchievementsService;
let mockAchievementsProgressRepository: Repository<AchievementProgress>;
let mockUser: User;
let mockUserInstance: User;
let mockAchievement: Achievement;
let mockAchievementInstance: Achievement;
let achievementsProgressService: AchievementsProgressService;
class StubAchievementProgressRepository extends Repository<AchievementProgress> { }

beforeEach(async (): Promise<void> => {
  mockAchievementsService = mock(AchievementsService);
  mockAchievementsProgressRepository = mock(StubAchievementProgressRepository);
  mockUser = mock(User);
  mockUserInstance = instance(mockUser);
  mockAchievement = mock(Achievement);
  mockAchievementInstance = instance(mockAchievement);
  achievementsProgressService = new AchievementsProgressService(
    instance(mockAchievementsProgressRepository),
    instance(mockAchievementsService));
});

describe("AchievementsProgressService tests", (): void => {

  /**
   * Test that all achievements are returned correctly
   */
  describe("Test getAchievementProgressForUser", (): void => {
    test("Should ensure that the user's progress is 0 if the user hasn't started the achievement yet", async (): Promise<void> => {
      when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(undefined);

      const foundAchievementProgress: AchievementProgress = await achievementsProgressService.getAchievementProgressForUser(mockAchievementInstance, mockUserInstance);
      expect(foundAchievementProgress.getAchievement())
        .toBe(mockAchievementInstance);
      expect(foundAchievementProgress.getProgress())
        .toEqual(0);

      verify(mockAchievementsProgressRepository.findOne(anything())).once();
    });

    test("Should ensure that the user's progress is fetched from the repository", async (): Promise<void> => {
      const testAchievementProgress: AchievementProgress = new AchievementProgress(mockAchievementInstance, mockUserInstance, 2);
      when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(testAchievementProgress);

      expect(await achievementsProgressService.getAchievementProgressForUser(mockAchievementInstance,
        mockUserInstance))
        .toBe(testAchievementProgress);

      verify(mockAchievementsProgressRepository.findOne(anything())).once();
    });
  });
});