import { Repository } from "typeorm";
import { AchievementsService, AchievementsProgressService } from "../../../src/services/achievements";
import { Achievement } from "../../../src/util/achievements";
import { mock, instance, when, verify, anything, deepEqual, reset } from "ts-mockito";
import { AchievementProgress, User } from "../../../src/db/entity/hub";

let mockAchievementsService: AchievementsService;
let mockAchievementsProgressRepository: Repository<AchievementProgress>;
let mockUser: User;
let mockUserInstance: User;
let mockAchievement: Achievement;
let mockAchievementInstance: Achievement;
let achievementsProgressService: AchievementsProgressService;
class StubAchievementProgressRepository extends Repository<AchievementProgress> { }

beforeAll((): void => {
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

afterEach((): void => {
  reset(mockAchievementsService);
  reset(mockAchievementsProgressRepository);
  reset(mockUser);
  reset(mockAchievement);
});

describe("AchievementsProgressService tests", (): void => {
  describe("Test getAchievementProgressForUser", (): void => {
    test("Should ensure that the user's progress is 0 if the user hasn't started the achievement yet", async (): Promise<void> => {
      when(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: mockAchievementInstance.getId(),
          user: mockUserInstance
        }
      }))).thenResolve(undefined);

      const foundAchievementProgress: AchievementProgress =
        await achievementsProgressService.getAchievementProgressForUser(mockAchievementInstance, mockUserInstance);

      expect(foundAchievementProgress.getAchievement())
        .toBe(mockAchievementInstance);
      expect(foundAchievementProgress.getProgress())
        .toEqual(0);

      verify(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: mockAchievementInstance.getId(),
          user: mockUserInstance
        }
      }))).once();
    });

    test("Should ensure that the user's progress is fetched from the repository", async (): Promise<void> => {
      const testAchievementProgress: AchievementProgress = new AchievementProgress(mockAchievementInstance, mockUserInstance, 2);
      when(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: mockAchievementInstance.getId(),
          user: mockUserInstance
        }
      })))
        .thenResolve(testAchievementProgress);

      expect(await achievementsProgressService.getAchievementProgressForUser(mockAchievementInstance,
        mockUserInstance))
        .toBe(testAchievementProgress);

      verify(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: mockAchievementInstance.getId(),
          user: mockUserInstance
        }
      }))).once();
    });
  });

  describe("Test getAchievementsProgressForUser", (): void => {
    test("Should ensure that an empty array is returned when there are no achievements", async (): Promise<void> => {
      when(mockAchievementsProgressRepository.find(anything())).thenResolve([]);
      when(mockAchievementsService.getAchievements()).thenResolve([]);

      expect(await achievementsProgressService.getAchievementsProgressForUser(mockUserInstance))
        .toEqual([]);

      verify(mockAchievementsProgressRepository.find(anything())).once();
      verify(mockAchievementsService.getAchievements()).once();
    });

    test(`Should ensure that progress for all achievements is returned
          when there is an AchievementProgress object for each achievement`, async (): Promise<void> => {
        const testAchievements: Achievement[] = [
          new Achievement(0, { title: "test", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" }),
          new Achievement(1, { title: "test2", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" })
        ];

        const testAchievementsProgress: AchievementProgress[] = [];
        const mockTestAchievementsProgress: AchievementProgress[] = [];

        // Setting up AchievementProgress objects such that they behave
        // as they would after being fetched from DB
        for (let i = 0; i < testAchievements.length; i++) {
          const mockAchievementProgress: AchievementProgress = mock(AchievementProgress);
          when(mockAchievementProgress.getAchievementId()).thenReturn(testAchievements[i].getId());
          mockTestAchievementsProgress.push(mockAchievementProgress);
          testAchievementsProgress.push(instance(mockAchievementProgress));
        }

        when(mockAchievementsProgressRepository.find(anything())).thenResolve(testAchievementsProgress);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const foundAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressForUser(mockUserInstance);

        expect(foundAchievementsProgress.length).toEqual(testAchievements.length);
        // Checking that the correct achievements were assigned to each AchievementProgress object
        for (let i = 0; i < mockTestAchievementsProgress.length; i++) {
          const achievementForProgressObject: Achievement = testAchievements.find((a: Achievement) => a.getId() === instance(mockTestAchievementsProgress[i]).getAchievementId());
          verify(mockTestAchievementsProgress[i].setAchievement(achievementForProgressObject)).once();
          expect(foundAchievementsProgress).toContain(instance(mockTestAchievementsProgress[i]));
        }

        verify(mockAchievementsProgressRepository.find(anything())).once();
        verify(mockAchievementsService.getAchievements()).once();
      });

    test(`Should ensure that progress for all achievements is returned
          when there are AchievementProgress objects only for some achievements`, async (): Promise<void> => {
        const testAchievements: Achievement[] = [
          new Achievement(0, { title: "test", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" }),
          new Achievement(1, { title: "test2", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" })
        ];

        const testAchievementsProgress: AchievementProgress[] = [];
        const mockTestAchievementsProgress: AchievementProgress[] = [];

        // Setting up AchievementProgress mocks
        // for only half of the achievements
        for (let i = 0; i < testAchievements.length / 2; i++) {
          const mockAchievementProgress: AchievementProgress = mock(AchievementProgress);
          when(mockAchievementProgress.getAchievementId()).thenReturn(testAchievements[i].getId());
          mockTestAchievementsProgress.push(mockAchievementProgress);
          testAchievementsProgress.push(instance(mockAchievementProgress));
        }

        when(mockAchievementsProgressRepository.find(anything())).thenResolve(testAchievementsProgress);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const foundAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressForUser(mockUserInstance);

        expect(foundAchievementsProgress.length).toEqual(testAchievements.length);
        // Checking that the correct achievements were assigned to each of the preexisting AchievementProgress object
        for (let i = 0; i < mockTestAchievementsProgress.length; i++) {
          const achievementForProgressObject: Achievement = testAchievements.find((a: Achievement) => a.getId() === instance(mockTestAchievementsProgress[i]).getAchievementId());
          verify(mockTestAchievementsProgress[i].setAchievement(achievementForProgressObject)).once();
          expect(foundAchievementsProgress).toContain(instance(mockTestAchievementsProgress[i]));
        }
        // Checking that new AchievementProgress objects were created for achievements that did
        // not have an AchievementProgress object before
        for (let i = testAchievements.length / 2; i < testAchievements.length; i++) {
          expect(foundAchievementsProgress
            .find((p: AchievementProgress) => p.getAchievement() === testAchievements[i]))
            .toBeTruthy();
        }

        verify(mockAchievementsProgressRepository.find(anything())).once();
        verify(mockAchievementsService.getAchievements()).once();
      });


    test(`Should ensure that progress for all achievements is returned
      when there aren't any AchievementProgress objects for any achievements`, async (): Promise<void> => {
        const testAchievements: Achievement[] = [
          new Achievement(0, { title: "test", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" }),
          new Achievement(1, { title: "test2", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" })
        ];

        when(mockAchievementsProgressRepository.find(anything())).thenResolve([]);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const foundAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressForUser(mockUserInstance);

        expect(foundAchievementsProgress.length).toEqual(testAchievements.length);
        // Checking that new AchievementProgress objects were created for achievements that did
        // not have an AchievementProgress object before
        for (let i = 0; i < testAchievements.length; i++) {
          expect(foundAchievementsProgress
            .find((p: AchievementProgress) => p.getAchievement() === testAchievements[i]))
            .toBeTruthy();
        }

        verify(mockAchievementsProgressRepository.find(anything())).once();
        verify(mockAchievementsService.getAchievements()).once();
      });
  });
});