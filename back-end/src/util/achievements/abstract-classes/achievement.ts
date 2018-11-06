import { Cache } from "../../cache";
import { getConnection } from "typeorm";
import { AchievementProgress, User } from "../../../db/entity/hub";
import { AchievementProgressCached } from "../../cache/models/objects/achievementProgressCached";
import { ApiError, HttpResponseCode } from "../../errorHandling";
import * as pbkdf2 from "pbkdf2";

/**
 * Abstract class for all achievements
 */
export abstract class Achievement {
  /**
   * The id of the achievement
   */
  public abstract id: string;
  /**
   * The title of the achievement
   */
  public abstract title: string;
  /**
   * The description of the achievement
   */
  public abstract description: string;
  /**
   * The prizes of the achievement
   */
  public abstract prizes: string;
  /**
   * The message to be sent to the user when the achievement is finished
   */
  public abstract finishMessage: string;
  /**
   * The maximum progress of this achievement
   */
  public abstract maxProgress: number;
  /**
   * Specifies whether or not a token is required when incrementing the user's progress on this achievement.
   * Set to on a basic implementation of an achievement
   */
  protected requiresToken: boolean = false;

  /**
   * Specifies whether or not the achievement contains multiple steps
   */
  protected isMultiStep: boolean = false;

  /**
   * Specifies whether or not the steps of the achievement must be completed in order
   */
  protected mustCompleteStepsInOrder: boolean = false;

  /**
   * Increments the user's progress on this achievement on the database
   * @param user The user
   * @param token Token used to verify the validity of the request to increment progress
   */
  public async incrementProgress(user: User, token?: string, step?: string): Promise<AchievementProgress> {
    // Checking the validity of the request
    if (this.requiresToken && !(await this.tokenIsValid(token, step))) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Invalid token provided");
    }
    if (this.isMultiStep && (isNaN(parseInt(step)) || Number(step) > this.maxProgress)) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Invalid step provided!");
    }
    let userProgressInDB: AchievementProgress;
    const userProgressInCache: AchievementProgressCached = await Cache.achievementsProgess.getElementForUser(user, this.id);
    if (userProgressInCache) {
      userProgressInDB = new AchievementProgress(this.id, user, userProgressInCache.progress, userProgressInCache.stepsCompleted);
    } else {
      userProgressInDB = new AchievementProgress(this.id, user);
    }
    userProgressInDB.stepsCompleted = this.checkCompletedSteps(step, userProgressInCache.progress, userProgressInCache.stepsCompleted);
    userProgressInDB.progress += 1;
    await this.updateUsersProgress(user, userProgressInDB.progress, userProgressInDB.stepsCompleted);
    if (userProgressInDB.progress === this.maxProgress) {
      this.finishAchievement(user);
    }
    return userProgressInDB;
  }

  /**
   * Updates the user's progress on this achievement in the database
   * @param user The user
   * @param progress The new progress value
   */
  public async updateUsersProgress(user: User, progress: number, stepsCompleted?: string): Promise<AchievementProgress> {
    const userProgress = new AchievementProgress(this.id, user, progress, stepsCompleted);
    await getConnection("hub")
      .getRepository(AchievementProgress)
      .save(userProgress);
    const userProgressInCache = new AchievementProgressCached(userProgress);
    Cache.achievementsProgess.storeElement(userProgressInCache);
    return userProgress;
  }

  /**
   * A method to check a user's progress in this achievement
   * @param user The user to check the achievement progress for
   */
  public async checkProgress(user: User): Promise<number> {
    const progress = (await getConnection("hub")
      .getRepository(AchievementProgress)
      .createQueryBuilder("achievementProgress")
      .leftJoinAndSelect("achievementProgress.user", "user")
      .where("achievementProgress.userId = :userId", { userId: user.id })
      .andWhere("achievementProgress.achievementId = :achievementId", { achievementId: this.id })
      .getOne()).progress;
    return progress;
  }

  /**
   * The basic implementation simply returns true.
   * The implementation in the child class should verify the validity of the token
   * and verify that the token is valid for the given step if the achviement has steps
   * @param token The token
   * @param step The step of the achievement
   */
  protected async tokenIsValid(token: string, step?: string): Promise<boolean> {
    const expectedToken = pbkdf2.pbkdf2Sync(
      `${this.id}->${this.isMultiStep ? step : ""}`,
      process.env.ACHIEVEMENT_TOKEN_SALT,
      1,
      10
    ).toString("base64");
    console.log(expectedToken);
    return token === expectedToken;
  }

  /**
   * Checks if the user completed the correct step of the achievement and returns a new string of completed steps.
   * @param step The step that was just completed
   * @param userProgress The user's progress before completing the step
   * @param stepsCompleted The steps that the user has already completed
   */
  protected checkCompletedSteps(step: string, userProgress: number, stepsCompleted: string): string {
    if (this.isMultiStep) {
      if (stepsCompleted.includes(step)) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "You have already completed this step!");
      }
      if (this.mustCompleteStepsInOrder && userProgress + 1 != Number(step)) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "The steps of this achievement must be completed in order!");
      }
      stepsCompleted += ` ${step}`;
    }
    return stepsCompleted;
  }

  /**
   * Sends a notification to the user that they have finished this achievement
   * @param user The user who finished the achievement
   */
  protected async finishAchievement(user: User) {
    // TODO: send a notification to the user
  }
}