import { CacheObject } from "../../abstract-classes";
import { Achievement } from "../../../achievements/abstract-classes";
import { Achievements } from "../../../achievements";
import { ApiError, HttpResponseCode } from "../../../errorHandling";
import { AchievementProgress, User } from "../../../../db/entity/hub";

/**
 * A cached user object
 */
export class AchievementProgressCached extends CacheObject {
  /**
   * The achievement
   */
  public achievement: Achievement;
  /**
   * The user
   */
  public user: User;
  /**
   * The user's progress on this achievement
   */
  public progress: number;

  /**
   * The amount of time the achievement progress object stays synced (miliseconds)
   * Set to 3 minutes
   */
  protected readonly expiresIn: number = 180000;

  /**
   * Creates a cached achivement progress object
   * @param _achievement The achievement
   * @param _user The user
   */
  constructor(achievementProgress: AchievementProgress) {
    super(`${achievementProgress.user.id}->${achievementProgress.achievementId}`);
    this.achievement = Achievements.getAchievementWithId(achievementProgress.achievementId);
    if (this.achievement === undefined) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR,
        `Achievement with id ${achievementProgress.achievementId} is not implemented!`);
    }
    this.user = achievementProgress.user;
    this.progress = achievementProgress.progress;
  }

  /**
   * Syncs this cached achievement progress with remote services
   */
  public async sync(): Promise<void> {
    this.progress = await this.achievement.checkProgress(this.user);
    this.syncedAt = Date.now();
  }
}