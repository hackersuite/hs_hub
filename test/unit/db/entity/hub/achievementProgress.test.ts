import { mock, reset, when, instance, verify } from "ts-mockito";
import { User, AchievementProgress } from "../../../../../src/db/entity/hub";
import { Achievement } from "../../../../../src/util/achievements";

const achievementId: number = 0;
let mockAchievement: Achievement;
let mockUser: User;

let achievementProgress: AchievementProgress;

const testAchievementProgressOptions = {
  progress: 2,
  stepsCompleted: [1, 2],
  prizeClaimed: true
};

beforeAll((): void => {
  mockUser = mock(User);
  mockAchievement = mock(Achievement);
});

beforeEach((): void => {
  when(mockAchievement.getId()).thenReturn(achievementId);
  achievementProgress = new AchievementProgress(
    instance(mockAchievement),
    instance(mockUser),
    testAchievementProgressOptions.progress,
    testAchievementProgressOptions.stepsCompleted,
    testAchievementProgressOptions.prizeClaimed
  );
});

afterEach((): void => {
  reset(mockUser);
  reset(mockAchievement);
});

describe("Achievement tests", (): void => {
  describe("Test getAchievementId", (): void => {
    test("Should return the correct id", (): void => {
      expect(achievementProgress.getAchievementId()).toBe(achievementId);
      verify(mockAchievement.getId()).once();
    });
  });

  describe("Test getProgress", (): void => {
    test("Should return the correct progress", (): void => {
      expect(achievementProgress.getProgress()).toBe(testAchievementProgressOptions.progress);
    });
  });

  describe("Test setProgress", (): void => {
    test("Should set the progress to the correct value", (): void => {
      achievementProgress.setProgress(testAchievementProgressOptions.progress + 1);
      expect(achievementProgress.getProgress()).toBe(testAchievementProgressOptions.progress + 1);
    });
  });

  describe("Test getUser", (): void => {
    test("Should return the correct user", (): void => {
      expect(achievementProgress.getUser()).toBe(instance(mockUser));
    });
  });

  describe("Test setUser", (): void => {
    test("Should change user to the correct value", (): void => {
      const newMockUser: User = mock(User);
      achievementProgress.setUser(instance(newMockUser));
      expect(achievementProgress.getUser()).toBe(instance(newMockUser));
      expect(achievementProgress.getUser()).not.toBe(instance(mockUser));
    });
  });

  describe("Test getCompletedSteps", (): void => {
    test("Should return the correct array of completed steps", (): void => {
      expect(achievementProgress.getCompletedSteps()).toBe(testAchievementProgressOptions.stepsCompleted);
    });
  });

  describe("Test addCompletedStep", (): void => {
    test("Should add a new step to the array of completed and increment the progress", (): void => {
      const mockStep: number = 3;
      const previousLength: number = testAchievementProgressOptions.stepsCompleted.length;
      achievementProgress.addCompletedStep(3);
      const currentLength: number = testAchievementProgressOptions.stepsCompleted.length;
      expect(currentLength - previousLength).toBe(1);
      expect(achievementProgress.getCompletedSteps()).toBe(testAchievementProgressOptions.stepsCompleted);
      expect(testAchievementProgressOptions.stepsCompleted[testAchievementProgressOptions.stepsCompleted.length - 1]).toBe(mockStep);
      expect(achievementProgress.getProgress()).toBe(testAchievementProgressOptions.progress + 1);

      // Removing the element that was added during the test
      testAchievementProgressOptions.stepsCompleted.pop();
    });
  });

  describe("Test getPrizeClaimed", (): void => {
    test("Should return the correct value for prizeClaimed", (): void => {
      expect(achievementProgress.getPrizeClaimed()).toBe(testAchievementProgressOptions.prizeClaimed);
    });
  });

  describe("Test setPrizeClaimed", (): void => {
    test("Should set prizeClaimed to the correct value", (): void => {
      achievementProgress.setPrizeClaimed(!testAchievementProgressOptions.prizeClaimed);
      expect(achievementProgress.getPrizeClaimed()).toBe(!testAchievementProgressOptions.prizeClaimed);
    });
  });

  describe("Test getAchievement", (): void => {
    test("Should return the correct achievment", (): void => {
      expect(achievementProgress.getAchievement()).toBe(instance(mockAchievement));
    });
  });

  describe("Test getAchievement", (): void => {
    test("Should change achievement to the correct value", (): void => {
      const newMockAchievement: Achievement = mock(Achievement);
      achievementProgress.setAchievement(instance(newMockAchievement));
      expect(achievementProgress.getAchievement()).toBe(instance(newMockAchievement));
      expect(achievementProgress.getAchievement()).not.toBe(instance(mockAchievement));
    });
  });

  describe("Test stepIsCompleted", (): void => {
    test("Should return true for a completed step", (): void => {
      expect(achievementProgress.stepIsCompleted(testAchievementProgressOptions.stepsCompleted[0]))
        .toBeTruthy();
    });

    test("Should return false for a step that has not yet been completed", (): void => {
      expect(achievementProgress.stepIsCompleted(25))
        .toBeFalsy();
    });
  });

  describe("Test stepIsTheNextConsecutiveStep", (): void => {
    test("Should return true when no steps have been completed and the given step is 1", (): void => {
      achievementProgress = new AchievementProgress(instance(mockAchievement), instance(mockUser), 0, []);
      expect(achievementProgress.stepIsTheNextConsecutiveStep(1)).toBeTruthy();
    });

    test("Should return true for a the next consecutive step", (): void => {
      expect(achievementProgress.stepIsTheNextConsecutiveStep(
        testAchievementProgressOptions.stepsCompleted[testAchievementProgressOptions.stepsCompleted.length - 1] + 1))
        .toBeTruthy();
    });

    test("Should return false for a step that is not the next consecutive step", (): void => {
      expect(achievementProgress.stepIsTheNextConsecutiveStep(
        testAchievementProgressOptions.stepsCompleted[testAchievementProgressOptions.stepsCompleted.length - 1] + 2))
        .toBeFalsy();
    });
  });

  describe("Test achievementIsCompleted", (): void => {
    test("Should return true when the achievement has been completed", (): void => {
      when(mockAchievement.getMaxProgress()).thenReturn(testAchievementProgressOptions.progress);

      expect(achievementProgress.achievementIsCompleted()).toBeTruthy();

      verify(mockAchievement.getMaxProgress()).once();
    });

    test("Should return false when the achievement has not been completed", (): void => {
      when(mockAchievement.getMaxProgress()).thenReturn(testAchievementProgressOptions.progress + 1);

      expect(achievementProgress.achievementIsCompleted()).toBeFalsy();

      verify(mockAchievement.getMaxProgress()).once();
    });
  });
});