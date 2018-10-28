import { AchievementProgressCached } from "../objects/achievementProgressCached";
import { CacheCollection } from "../../abstract-classes";
import { AchievementProgress } from "../../../../db/entity/hub";
import { getConnection } from "typeorm";

/**
 * A cached collection of progress for achievements
 */
export class AchievementProgressCacheCollection extends CacheCollection<AchievementProgressCached> {
  /**
   * The amount of time the achievement progress collection stays synced (miliseconds).
   * Set to never expire
   */
  protected expiresIn: number = -1;

  /**
   * Syncs the progress of all achievements with the database
   */
  public async sync(): Promise<void> {
    // Fetching the achievement progress objects from the database
    const achievementsProgressObjects: AchievementProgress[] = await getConnection("hub")
      .getRepository(AchievementProgress)
      .createQueryBuilder("achievementProgress")
      .getMany();
    // Updating the instance variables
    this.syncedAt = Date.now();
    this.elements = new Map<string, AchievementProgressCached>();
    achievementsProgressObjects.forEach((achievementProgress: AchievementProgress) => {
      const syncedAchievementProgress =
        new AchievementProgressCached(achievementProgress.achievementId, achievementProgress.user.id);
      this.elements[syncedAchievementProgress.id] = syncedAchievementProgress;
    });
  }
}