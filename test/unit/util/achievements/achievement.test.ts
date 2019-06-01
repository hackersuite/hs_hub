import { Achievement } from "../../../../src/util/achievements";

const achievementId: number = 0;
const tokenForNoStep: string = "x6ENEedMH7kEDg==";
const tokenForStep1: string = "yy3ZQcwl3JfFyQ==";
let achievement: Achievement;

const achievementTokenSaltForTests: string = "saltysalt";

const testAchievementOptions = {
  allTrue: {
    title: "test",
    description: "teeeeest",
    prizeURL: "test.com",
    maxProgress: 3,
    requiresToken: true,
    mustCompleteStepsInOrder: true,
    isManual: true
  },
  singleStep: {
    title: "test",
    description: "teeeeest",
    prizeURL: "test.com",
    maxProgress: 1,
    requiresToken: true,
    mustCompleteStepsInOrder: true,
    isManual: true
  },
  tokenFalse: {
    title: "test",
    description: "teeeeest",
    prizeURL: "test.com",
    maxProgress: 3,
    requiresToken: false,
    mustCompleteStepsInOrder: true,
    isManual: true
  },
  inOrderFalse: {
    title: "test",
    description: "teeeeest",
    prizeURL: "test.com",
    maxProgress: 3,
    requiresToken: true,
    mustCompleteStepsInOrder: false,
    isManual: true
  },
  manualFalse: {
    title: "test",
    description: "teeeeest",
    prizeURL: "test.com",
    maxProgress: 3,
    requiresToken: true,
    mustCompleteStepsInOrder: false,
    isManual: true
  },
};

beforeEach((): void => {
  achievement = new Achievement(0, testAchievementOptions.allTrue);
});

describe("Achievement tests", (): void => {
  describe("Test getId", (): void => {
    test("Should return the correct id", (): void => {
      expect(achievement.getId()).toBe(achievementId);
    });
  });

  describe("Test getTitle", (): void => {
    test("Should return the correct title", (): void => {
      expect(achievement.getTitle()).toBe(testAchievementOptions.allTrue.title);
    });
  });

  describe("Test getDescription", (): void => {
    test("Should return the correct description", (): void => {
      expect(achievement.getDescription()).toBe(testAchievementOptions.allTrue.description);
    });
  });

  describe("Test getPrizeURL", (): void => {
    test("Should return the correct prize URL", (): void => {
      expect(achievement.getPrizeURL()).toBe(testAchievementOptions.allTrue.prizeURL);
    });
  });

  describe("Test getMaxProgress", (): void => {
    test("Should return the correct max progress", (): void => {
      expect(achievement.getMaxProgress()).toBe(testAchievementOptions.allTrue.maxProgress);
    });
  });

  describe("Test getRequiresToken", (): void => {
    test("Should return the correct value for requiresToken", (): void => {
      expect(achievement.getRequiresToken()).toBe(testAchievementOptions.allTrue.requiresToken);
      achievement = new Achievement(achievementId, testAchievementOptions.tokenFalse);
      expect(achievement.getRequiresToken()).toBe(testAchievementOptions.tokenFalse.requiresToken);
    });
  });

  describe("Test getIsManual", (): void => {
    test("Should return the correct value for isManual", (): void => {
      expect(achievement.getIsManual()).toBe(testAchievementOptions.allTrue.isManual);
      achievement = new Achievement(achievementId, testAchievementOptions.manualFalse);
      expect(achievement.getIsManual()).toBe(testAchievementOptions.manualFalse.isManual);
    });
  });

  describe("Test getMustCompleteStepsInOrder", (): void => {
    test("Should return the correct value for mustCompleteStepsInOrder", (): void => {
      expect(achievement.getMustCompleteStepsInOrder()).toBe(testAchievementOptions.allTrue.mustCompleteStepsInOrder);
      achievement = new Achievement(achievementId, testAchievementOptions.inOrderFalse);
      expect(achievement.getMustCompleteStepsInOrder()).toBe(testAchievementOptions.inOrderFalse.mustCompleteStepsInOrder);
    });
  });

  describe("Test progressIsValid", (): void => {
    test("Should return true for each value from 0 to maxProgress", (): void => {
      for (let i = 0; i < testAchievementOptions.allTrue.maxProgress; i++) {
        expect(achievement.progressIsValid(i)).toBeTruthy();
      }
    });

    test("Should return false when progress is less than 0", (): void => {
      expect(achievement.progressIsValid(-1)).toBeFalsy();
    });

    test("Should return false when progress is greater than maxProgress", (): void => {
      expect(achievement.progressIsValid(testAchievementOptions.allTrue.maxProgress + 1)).toBeFalsy();
    });
  });

  describe("Test stepIsPossible", (): void => {
    test("Should return true is for each value from 0 to maxProgress", (): void => {
      for (let i = 0; i < testAchievementOptions.allTrue.maxProgress; i++) {
        expect(achievement.stepIsPossible(i)).toBeTruthy();
      }
    });

    test("Should return false when step is less than 0", (): void => {
      expect(achievement.stepIsPossible(-1)).toBeFalsy();
    });

    test("Should return false when step is greater than maxProgress", (): void => {
      expect(achievement.stepIsPossible(testAchievementOptions.allTrue.maxProgress + 1)).toBeFalsy();
    });
  });

  describe("Test generateToken", (): void => {
    let achievementTokenSaltBeforeTest: string;

    // This method uses an environment variable so we must set it up before the tests.
    // This is done before and after each test in order to minimize the probability
    // that the modified environment variable might be used by any other tests running in parallel
    beforeEach((): void => {
      achievementTokenSaltBeforeTest = process.env.ACHIEVEMENT_TOKEN_SALT;
      process.env.ACHIEVEMENT_TOKEN_SALT = achievementTokenSaltForTests;
    })

    afterEach((): void => {
      process.env.ACHIEVEMENT_TOKEN_SALT = achievementTokenSaltBeforeTest;
    });

    test(`Should return the correct token when no step is provided
        and the achievement is multi-step`, (): void => {
        expect(achievement.generateToken()).toBe(tokenForNoStep);
      });

    test(`Should return the correct token when step is provided
        and the achievement is multi-step`, (): void => {
        expect(achievement.generateToken(1)).toBe(tokenForStep1);
      });

    test(`Should return the correct token when no step is provided
      and the achievement is single-step`, (): void => {
        achievement = new Achievement(achievementId, testAchievementOptions.singleStep);
        expect(achievement.generateToken()).toBe(tokenForNoStep);
      });

    test(`Should return the correct token step is provided
      and the achievement is single-step`, (): void => {
        achievement = new Achievement(achievementId, testAchievementOptions.singleStep);
        expect(achievement.generateToken(1)).toBe(tokenForNoStep);
      });
  });

  describe("Test tokenIsValidForStep", (): void => {
    let achievementTokenSaltBeforeTest: string;

    // This method uses an environment variable so we must set it up before the tests.
    // This is done before and after each test in order to minimize the probability
    // that the modified environment variable might be used by any other tests running in parallel
    beforeEach((): void => {
      achievementTokenSaltBeforeTest = process.env.ACHIEVEMENT_TOKEN_SALT;
      process.env.ACHIEVEMENT_TOKEN_SALT = achievementTokenSaltForTests;
    })

    afterEach((): void => {
      process.env.ACHIEVEMENT_TOKEN_SALT = achievementTokenSaltBeforeTest;
    });

    test(`Should return true to any token if the achievement does not require a token`, (): void => {
      achievement = new Achievement(achievementId, testAchievementOptions.tokenFalse);
      expect(achievement.tokenIsValidForStep(tokenForNoStep)).toBeTruthy();
      expect(achievement.tokenIsValidForStep(tokenForStep1)).toBeTruthy();
      expect(achievement.tokenIsValidForStep("randomtoken")).toBeTruthy();
    });

    test(`Should ensure that step is optional for single-step achievements`, (): void => {
      achievement = new Achievement(achievementId, testAchievementOptions.singleStep);
      expect(achievement.tokenIsValidForStep(tokenForNoStep)).toBeTruthy();
      expect(achievement.tokenIsValidForStep(tokenForNoStep, 1)).toBeTruthy();
      expect(achievement.tokenIsValidForStep(tokenForStep1)).toBeFalsy();
    });

    test(`Should ensure that only the correct token is accepted for each step`, (): void => {
      expect(achievement.tokenIsValidForStep(tokenForNoStep, 0)).toBeTruthy();
      expect(achievement.tokenIsValidForStep(tokenForStep1, 0)).toBeFalsy();
      expect(achievement.tokenIsValidForStep(tokenForStep1, 1)).toBeTruthy();
      expect(achievement.tokenIsValidForStep(tokenForNoStep, 1)).toBeFalsy();
    });
  });
});