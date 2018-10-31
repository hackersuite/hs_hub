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
   * Specifies wehter or not a token is required when incrementing the user's progress on this achievement.
   * Set to on a basic implementation of an achievement
   */
  protected requiresToken: boolean = false;

  /**
   * Increments the user's progress on this achievement on the database
   * @param user The user
   * @param token Token used to verify the validity of the request to increment progress
   */
  public async incrementProgress(user: User, token?: string, step?: string): Promise<number> {
    // Checking the validity of the request
    if (token && !(await this.tokenIsValid(token, step)) || !token && this.requiresToken) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Invalid token provided");
    }
    const userProgress: AchievementProgressCached = await Cache.achievementsProgess.getElementForUser(user, this.id);
    if (userProgress) {
      if (userProgress.progress != this.maxProgress) {
        // TODO: check if the user has not completed this step yet
        userProgress.progress = Math.min(userProgress.progress + 1, this.maxProgress);
        await this.updateUsersProgress(user, userProgress.progress);
        if (userProgress.progress == this.maxProgress) {
          this.finishAchievement(user);
        }
        return userProgress.progress;
      } else {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "You have already completed this achievement!");
      }
    } else {
      await this.createUsersProgress(user);
      return 1;
    }
  }

  /**
   * Updates the user's progress on this achievement in the database
   * @param user The user
   * @param progress The new progress value
   */
  private async updateUsersProgress(user: User, progress: number): Promise<void> {
    await getConnection("hub")
      .createQueryBuilder()
      .update(AchievementProgress)
      .set({ progress })
      .where("userId = :userId", { userId: user.id })
      .andWhere("achievementId = :achievementId", { achievementId: this.id })
      .execute();
  }

  /**
   * Creates an initial achievement progress row for this achievement
   * @param user The user that made progress
   */
  private async createUsersProgress(user: User): Promise<void> {
    await getConnection("hub")
      .createQueryBuilder()
      .insert()
      .into(AchievementProgress)
      .values([{
        achievementId: this.id,
        user: user,
        progress: 1
      }])
      .execute();
    // REVIEW: might be a good idea to check if the query was successful
    const objInCache = new AchievementProgressCached(new AchievementProgress(this.id, user));
    Cache.achievementsProgess.storeElement(objInCache);
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
      `${this.id}->${step ? step : ""}`,
      process.env.ACHIEVEMENT_TOKEN_SALT,
      1,
      10
    ).toString("base64");
    return token === expectedToken;
  }

  /**
   * Sends a notification to the user that they have finished this achievement
   * @param user The user who finished the achievement
   */
  protected async finishAchievement(user: User) {
    // TODO: send a notification to the user
  }
}