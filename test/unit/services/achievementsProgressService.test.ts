import { Repository } from "typeorm";
import { AchievementsService, AchievementsProgressService } from "../../../src/services/achievements";
import { Achievement } from "../../../src/util/achievements";
import { mock, instance, when, verify, deepEqual, reset, anything, resetCalls } from "ts-mockito";
import { AchievementProgress, User } from "../../../src/db/entity/hub";

let mockAchievementsService: AchievementsService;
let mockAchievementsProgressRepository: Repository<AchievementProgress>;
let mockUser: User;
let mockAchievement: Achievement;
let mockAchievementProgress: AchievementProgress;
let achievementsProgressService: AchievementsProgressService;
class StubAchievementProgressRepository extends Repository<AchievementProgress> { }

// The achievments used in the tests
// the length of this array should be a multiple of 2
const testAchievements: Achievement[] = [
  new Achievement(0, { title: "test", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" }),
  new Achievement(1, { title: "test2", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" })
];

beforeAll((): void => {
  mockAchievementsService = mock(AchievementsService);
  mockAchievementsProgressRepository = mock(StubAchievementProgressRepository);
  mockUser = mock(User);
  mockAchievement = mock(Achievement);
  mockAchievementProgress = mock(AchievementProgress);
  achievementsProgressService = new AchievementsProgressService(
    instance(mockAchievementsProgressRepository),
    instance(mockAchievementsService));
});

afterEach((): void => {
  reset(mockAchievementsService);
  reset(mockAchievementsProgressRepository);
  reset(mockUser);
  reset(mockAchievement);
  reset(mockAchievementProgress);
});

describe("AchievementsProgressService tests", (): void => {
  describe("Test getAchievementProgressForUser", (): void => {
    test("Should ensure that the user's progress is 0 if the user hasn't started the achievement yet", async (): Promise<void> => {
      when(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: instance(mockAchievement).getId(),
          user: instance(mockUser)
        }
      }))).thenResolve(undefined);

      const foundAchievementProgress: AchievementProgress =
        await achievementsProgressService.getAchievementProgressForUser(instance(mockAchievement), instance(mockUser));

      expect(foundAchievementProgress.getAchievement())
        .toBe(instance(mockAchievement));
      expect(foundAchievementProgress.getProgress())
        .toEqual(0);

      verify(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: instance(mockAchievement).getId(),
          user: instance(mockUser)
        }
      }))).once();
    });

    test("Should ensure that the user's progress is fetched from the repository", async (): Promise<void> => {
      const testAchievementProgress: AchievementProgress = new AchievementProgress(instance(mockAchievement), instance(mockUser), 2);
      when(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: instance(mockAchievement).getId(),
          user: instance(mockUser)
        }
      })))
        .thenResolve(testAchievementProgress);

      expect(await achievementsProgressService.getAchievementProgressForUser(instance(mockAchievement),
        instance(mockUser)))
        .toBe(testAchievementProgress);

      verify(mockAchievementsProgressRepository.findOne(deepEqual({
        where: {
          achievementId: instance(mockAchievement).getId(),
          user: instance(mockUser)
        }
      }))).once();
    });
  });

  describe("Test getAchievementsProgressForUser", (): void => {
    test("Should ensure that an empty array is returned when there are no achievements", async (): Promise<void> => {
      when(mockAchievementsProgressRepository.find(deepEqual({
        where: {
          user: instance(mockUser)
        }
      }))).thenResolve([]);
      when(mockAchievementsService.getAchievements()).thenResolve([]);

      expect(await achievementsProgressService.getAchievementsProgressForUser(instance(mockUser)))
        .toEqual([]);

      verify(mockAchievementsProgressRepository.find(deepEqual({
        where: {
          user: instance(mockUser)
        }
      }))).once();
      verify(mockAchievementsService.getAchievements()).once();
    });

    test(`Should ensure that progress for all achievements is returned
        when there is an AchievementProgress object for each achievement`, async (): Promise<void> => {
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

        when(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            user: instance(mockUser)
          }
        }))).thenResolve(testAchievementsProgress);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const foundAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressForUser(instance(mockUser));

        expect(foundAchievementsProgress.length).toEqual(testAchievements.length);
        // Checking that the correct achievements were assigned to each AchievementProgress object
        for (let i = 0; i < mockTestAchievementsProgress.length; i++) {
          const achievementForProgressObject: Achievement = testAchievements.find((a: Achievement) => a.getId() === instance(mockTestAchievementsProgress[i]).getAchievementId());
          verify(mockTestAchievementsProgress[i].setAchievement(achievementForProgressObject)).once();
          expect(foundAchievementsProgress).toContain(instance(mockTestAchievementsProgress[i]));
        }

        verify(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            user: instance(mockUser)
          }
        }))).once();
        verify(mockAchievementsService.getAchievements()).once();
      });

    test(`Should ensure that progress for all achievements is returned
        when there are AchievementProgress objects only for some achievements`, async (): Promise<void> => {
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

        when(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            user: instance(mockUser)
          }
        }))).thenResolve(testAchievementsProgress);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const foundAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressForUser(instance(mockUser));

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

        verify(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            user: instance(mockUser)
          }
        }))).once();
        verify(mockAchievementsService.getAchievements()).once();
      });


    test(`Should ensure that progress for all achievements is returned
        when there aren't any AchievementProgress objects for any achievements`, async (): Promise<void> => {
        const testAchievements: Achievement[] = [
          new Achievement(0, { title: "test", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" }),
          new Achievement(1, { title: "test2", description: "teeest", maxProgress: 0, prizeURL: "tessst.com" })
        ];

        when(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            user: instance(mockUser)
          }
        }))).thenResolve([]);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const foundAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressForUser(instance(mockUser));

        expect(foundAchievementsProgress.length).toEqual(testAchievements.length);
        // Checking that new AchievementProgress objects were created for achievements that did
        // not have an AchievementProgress object before
        for (let i = 0; i < testAchievements.length; i++) {
          expect(foundAchievementsProgress
            .find((p: AchievementProgress) => p.getAchievement() === testAchievements[i]))
            .toBeTruthy();
        }

        verify(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            user: instance(mockUser)
          }
        }))).once();
        verify(mockAchievementsService.getAchievements()).once();
      });
  });

  describe("Test getAchievementsProgressThatCanClaimPrize", (): void => {
    test(`Should ensure that an empty array is returned
        when no achievements have been completed or their prizes have already been claimed`, async (): Promise<void> => {
        when(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            prizeClaimed: false
          }
        }))).thenResolve([]);
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        expect(await achievementsProgressService.getAchievementsProgressThatCanClaimPrize())
          .toEqual([]);

        verify(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            prizeClaimed: false
          }
        }))).once();
        verify(mockAchievementsService.getAchievements()).once();
      });

    test(`Should ensure that an AchievementProgress object is returned for each
        achievement when all achievements are completed but prizes for them have not yet been claimed`, async (): Promise<void> => {
        // Creating AchievementProgress objects
        // that mark each achievement as completed
        const mockAchievementsProgress: AchievementProgress[] = [];
        testAchievements.forEach((achievement: Achievement) => {
          const mockAchievementProgress: AchievementProgress = mock(AchievementProgress);
          when(mockAchievementProgress.getAchievementId()).thenReturn(achievement.getId());
          when(mockAchievementProgress.achievementIsCompleted()).thenReturn(true);
          mockAchievementsProgress.push(mockAchievementProgress);
        });

        when(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            prizeClaimed: false
          }
        }))).thenResolve(mockAchievementsProgress.map((ap: AchievementProgress) => instance(ap)));
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const returnedAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressThatCanClaimPrize();
        expect(returnedAchievementsProgress.length).toEqual(mockAchievementsProgress.length);

        // The service should have checked if the achievement is complete
        // for all AchievementProgress objects returned by the repository
        mockAchievementsProgress.forEach((ap: AchievementProgress) => {
          verify(ap.achievementIsCompleted()).once();
        });

        // There should be an AchievementProgress object for each achievement in the result
        // and all AchievementProgress objects should be the object returned by the repository
        testAchievements.forEach((achievement: Achievement, index: number) => {
          const returnedProgress: AchievementProgress =
            returnedAchievementsProgress.find((ap: AchievementProgress) => ap.getAchievementId() === achievement.getId());
          expect(returnedProgress).toBe(instance(mockAchievementsProgress[index]));
        });

        verify(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            prizeClaimed: false
          }
        }))).once();
        verify(mockAchievementsService.getAchievements()).once();
      });

    test(`Should ensure that an AchievementProgress object is returned for each
        completed achievement but not for uncompleted achievements`, async (): Promise<void> => {
        // Creating AchievementProgress objects
        // that mark each achievement as completed
        const mockAchievementsProgress: AchievementProgress[] = [];
        for (let i = 0; i < testAchievements.length / 2; i++) {
          const achievement: Achievement = testAchievements[i];
          when(mockAchievementProgress.getAchievementId()).thenReturn(achievement.getId());
          when(mockAchievementProgress.achievementIsCompleted()).thenReturn(true);
          mockAchievementsProgress.push(mockAchievementProgress);
        }

        when(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            prizeClaimed: false
          }
        }))).thenResolve(mockAchievementsProgress.map((ap: AchievementProgress) => instance(ap)));
        when(mockAchievementsService.getAchievements()).thenResolve(testAchievements);

        const returnedAchievementsProgress: AchievementProgress[] =
          await achievementsProgressService.getAchievementsProgressThatCanClaimPrize();
        expect(returnedAchievementsProgress.length).toEqual(mockAchievementsProgress.length);

        // The service should have checked if the achievement is complete
        // for all AchievementProgress objects returned by the repository
        mockAchievementsProgress.forEach((ap: AchievementProgress) => {
          verify(ap.achievementIsCompleted()).once();
        });

        // There should be an AchievementProgress object for each completed achievement in the result
        // and all AchievementProgress objects should be the object returned by the repository
        for (let i = 0; i < testAchievements.length / 2; i++) {
          const achievement: Achievement = testAchievements[i];
          const returnedProgress: AchievementProgress =
            returnedAchievementsProgress.find((ap: AchievementProgress) => ap.getAchievementId() === achievement.getId());
          expect(returnedProgress).toBe(instance(mockAchievementsProgress[i]));
        }

        verify(mockAchievementsProgressRepository.find(deepEqual({
          where: {
            prizeClaimed: false
          }
        }))).once();
        verify(mockAchievementsService.getAchievements()).once();
      });
  });

  describe("Test setAchievementProgressForUser", (): void => {
    test(`Should ensure that an error is thrown when the given progress
        is not possible for given achievement`, async (): Promise<void> => {
        const mockProgress: number = 2;
        when(mockAchievement.progressIsValid(mockProgress)).thenReturn(false);

        try {
          expect(await achievementsProgressService.setAchievementProgressForUser(mockProgress, instance(mockAchievement), instance(mockUser)))
            .toThrow();
        } catch (error) {
          expect(error).toEqual(new Error("Invalid progress provided!"));
        }

        verify(mockAchievement.progressIsValid(mockProgress)).once();
      });

    test(`Should ensure that the new progress is set and it is saved in the repository`, async (): Promise<void> => {
      when(mockAchievement.progressIsValid(anything())).thenReturn(true);

      const mockProgress: number = 2;

      when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

      expect(await achievementsProgressService.setAchievementProgressForUser(mockProgress, instance(mockAchievement), instance(mockUser)))
        .toBe(instance(mockAchievementProgress));

      verify(mockAchievementProgress.setProgress(mockProgress)).once();
      verify(mockAchievementsProgressRepository.save(instance(mockAchievementProgress))).once();
    });
  });

  describe("Test setAchievementCompleteForUser", (): void => {
    test(`Should ensure that the user's progress for the achievement is set to the
        maximum progress for the achievement`, async (): Promise<void> => {
        const mockMaxProgress: number = 2;
        when(mockAchievement.getMaxProgress()).thenReturn(mockMaxProgress);

        const expectedAchievementProgress: AchievementProgress =
          new AchievementProgress(instance(mockAchievement), instance(mockUser), mockMaxProgress);
        expect(await achievementsProgressService.setAchievementCompleteForUser(instance(mockAchievement), instance(mockUser)))
          .toEqual(expectedAchievementProgress);

        verify(mockAchievement.getMaxProgress()).twice();
        verify(mockAchievementsProgressRepository.save(deepEqual(expectedAchievementProgress))).once();
      });
  });

  describe("Test giveAchievementPrizeToUser", (): void => {
    test(`Should ensure that an error is thrown if the user has not completed the achievement`, async (): Promise<void> => {
      const mockMaxProgress: number = 3;
      when(mockAchievementProgress.getProgress()).thenReturn(mockMaxProgress - 1);
      when(mockAchievement.getMaxProgress()).thenReturn(mockMaxProgress);
      when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

      try {
        expect(
          await achievementsProgressService.giveAchievementPrizeToUser(instance(mockAchievement), instance(mockUser))
        ).toThrow();
      } catch (error) {
        expect(error).toEqual(new Error("The user hasn't completed this achievement yet!"));
      }

      verify(mockAchievementsProgressRepository.findOne(anything())).once();
      verify(mockAchievementProgress.getProgress()).once();
      verify(mockAchievement.getMaxProgress()).once();
    });

    test(`Should ensure that prizeClaimed is set to true and the new progress object is saved`, async (): Promise<void> => {
      const mockMaxProgress: number = 3;
      when(mockAchievementProgress.getProgress()).thenReturn(mockMaxProgress);
      when(mockAchievement.getMaxProgress()).thenReturn(mockMaxProgress);
      when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

      expect(
        await achievementsProgressService.giveAchievementPrizeToUser(instance(mockAchievement), instance(mockUser))
      ).toBe(instance(mockAchievementProgress));

      verify(mockAchievementProgress.setPrizeClaimed(true)).once();
      verify(mockAchievementsProgressRepository.save(instance(mockAchievementProgress))).once();
    });
  });

  describe("Test completeAchievementStepForUser", (): void => {
    test(`Should ensure that an error is thrown when trying to complete a step for
        a manual achievement`, async (): Promise<void> => {
        when(mockAchievement.getIsManual()).thenReturn(true);

        try {
          expect(
            await achievementsProgressService.completeAchievementStepForUser(0, "", instance(mockAchievement), instance(mockUser))
          ).toThrow();
        } catch (error) {
          expect(error).toEqual(new Error("This achievement can only be manually awarded by an organiser!"));
        }

        verify(mockAchievement.getIsManual()).once();
      });

    test(`Should ensure that an error is thrown when the given token is invalid`, async (): Promise<void> => {
      when(mockAchievement.getIsManual()).thenReturn(false);
      const mockToken: string = "token";
      const mockStep: number = 1;
      when(mockAchievement.tokenIsValidForStep(mockToken, mockStep)).thenReturn(false);

      try {
        expect(
          await achievementsProgressService.completeAchievementStepForUser(mockStep, mockToken, instance(mockAchievement), instance(mockUser))
        ).toThrow();
      } catch (error) {
        expect(error).toEqual(new Error("Invalid token provided!"));
      }

      verify(mockAchievement.tokenIsValidForStep(mockToken, mockStep)).once();
    });

    test(`Should ensure that an error is thrown when the given step is not possible for
          the achievement`, async (): Promise<void> => {
        when(mockAchievement.getIsManual()).thenReturn(false);
        const mockStep: number = 1;
        when(mockAchievement.tokenIsValidForStep(anything(), anything())).thenReturn(true);
        when(mockAchievement.stepIsPossible(mockStep)).thenReturn(false);

        try {
          expect(
            await achievementsProgressService.completeAchievementStepForUser(mockStep, "", instance(mockAchievement), instance(mockUser))
          ).toThrow();
        } catch (error) {
          expect(error).toEqual(new Error("The given step is impossible for this achievement!"));
        }

        verify(mockAchievement.stepIsPossible(mockStep)).once();
      });

    test(`Should ensure that an error is thrown when trying to complete a step
        that has been completed already`, async (): Promise<void> => {
        when(mockAchievementProgress.stepIsCompleted(anything())).thenReturn(true);

        when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

        when(mockAchievement.getIsManual()).thenReturn(false);
        when(mockAchievement.tokenIsValidForStep(anything(), anything())).thenReturn(true);
        when(mockAchievement.stepIsPossible(anything())).thenReturn(true);

        try {
          expect(
            await achievementsProgressService.completeAchievementStepForUser(0, "", instance(mockAchievement), instance(mockUser))
          ).toThrow();
        } catch (error) {
          expect(error).toEqual(new Error("The given step is already completed!"));
        }

        verify(mockAchievementsProgressRepository.findOne(anything())).once();
      });

    test(`Should ensure that an error is thrown when trying to complete steps out-of-order
        for an in-order achievement`, async (): Promise<void> => {
        when(mockAchievementProgress.stepIsCompleted(anything())).thenReturn(false);
        when(mockAchievementProgress.stepIsTheNextConsecutiveStep(anything())).thenReturn(false);

        when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

        when(mockAchievement.getIsManual()).thenReturn(false);
        when(mockAchievement.tokenIsValidForStep(anything(), anything())).thenReturn(true);
        when(mockAchievement.stepIsPossible(anything())).thenReturn(true);
        when(mockAchievement.getMustCompleteStepsInOrder()).thenReturn(true);

        try {
          expect(
            await achievementsProgressService.completeAchievementStepForUser(0, "", instance(mockAchievement), instance(mockUser))
          ).toThrow();
        } catch (error) {
          expect(error).toEqual(new Error("The steps of this achievement must be completed in order!"));
        }

        verify(mockAchievementsProgressRepository.findOne(anything())).once();
        verify(mockAchievementProgress.stepIsTheNextConsecutiveStep(anything())).once();
        verify(mockAchievement.getMustCompleteStepsInOrder()).once();
      });

    test(`Should ensure that the service completes the step when trying to complete the steps
      out-of-order for an out-of-order achievement`, async (): Promise<void> => {
        when(mockAchievementProgress.stepIsCompleted(anything())).thenReturn(false);
        when(mockAchievementProgress.stepIsTheNextConsecutiveStep(anything())).thenReturn(false);

        when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

        when(mockAchievement.getIsManual()).thenReturn(false);
        when(mockAchievement.tokenIsValidForStep(anything(), anything())).thenReturn(true);
        when(mockAchievement.stepIsPossible(anything())).thenReturn(true);
        when(mockAchievement.getMustCompleteStepsInOrder()).thenReturn(false);

        expect(await achievementsProgressService.completeAchievementStepForUser(0, "", instance(mockAchievement), instance(mockUser))
        ).toBe(instance(mockAchievementProgress));

        verify(mockAchievementProgress.addCompletedStep(anything())).once();
        verify(mockAchievementsProgressRepository.save(instance(mockAchievementProgress))).once();
      });

    test(`Should ensure that the service completes the step when trying to complete the steps
        in-order for an in-order achievement`, async (): Promise<void> => {
        when(mockAchievementProgress.stepIsCompleted(anything())).thenReturn(false);
        when(mockAchievementProgress.stepIsTheNextConsecutiveStep(anything())).thenReturn(true);

        when(mockAchievementsProgressRepository.findOne(anything())).thenResolve(instance(mockAchievementProgress));

        when(mockAchievement.getIsManual()).thenReturn(false);
        when(mockAchievement.tokenIsValidForStep(anything(), anything())).thenReturn(true);
        when(mockAchievement.stepIsPossible(anything())).thenReturn(true);
        when(mockAchievement.getMustCompleteStepsInOrder()).thenReturn(true);

        expect(await achievementsProgressService.completeAchievementStepForUser(0, "", instance(mockAchievement), instance(mockUser))
        ).toBe(instance(mockAchievementProgress));

        verify(mockAchievementProgress.addCompletedStep(anything())).once();
        verify(mockAchievementsProgressRepository.save(instance(mockAchievementProgress))).once();
      });
  });
});