import { AchievementProgressCached } from "../objects/achievementProgressCached";
import { CacheCollection } from "../../abstract-classes";
import { AchievementProgress } from "../../../../db/entity/hub";
import { getConnection } from "typeorm";
import { Achievements } from "../../../achievements";
import { Achievement } from "../../../achievements/abstract-classes";

/**
 * A cached collection of progress on achievements
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
        new AchievementProgressCached(achievementProgress);
      this.elements[syncedAchievementProgress.id] = syncedAchievementProgress;
    });
  }

  /**
   * Syncs a user's progress on all achievements.
   * Faster than syncing each object separately as it uses a batch DB query.
   * @param userId The user to sync the achievements progress for
   */
  public async syncForUser(userId: number): Promise<void> {
    // Finding the objects that need to be synced
    const achievementsProgressToSync: string[] = [];
    Achievements.getAchievements().forEach((achievement: Achievement) => {
      const achievementProgressId = `${userId}->${achievement.id}`;
      if (!this.elements.has(achievementProgressId) ||
        this.elements[achievementProgressId].isExpired()) {
        achievementsProgressToSync.push(achievement.id);
      }
    });

    // Sending a query for the new data
    const achievementsProgressForUser = await getConnection("hub")
      .getRepository(AchievementProgress)
      .createQueryBuilder("achievementProgress")
      .where("achievementProgress.userId = :userId", { userId })
      .andWhere("achievementProgress.achievementId IN :achievementsProgressToSync", { achievementsProgressToSync })
      .getMany();

    // Updating the collection
    achievementsProgressForUser.forEach((achievementProgress: AchievementProgress) => {
      const syncedAchievementProgress =
        new AchievementProgressCached(achievementProgress);
      this.elements[syncedAchievementProgress.id] = syncedAchievementProgress;
    });
  }

  /**
   * Returns the user's progress on all implemented achievements
   * @param userId The user
   */
  public async getUserProgressForAllAchievements(userId: number): Promise<Map<string, number>> {
    // Batch updating the user's progress in the cache
    await this.syncForUser(userId);

    // Extracting the data from the cache
    const userProgressOnAllAchievements = new Map<string, number>();
    for (const achievement of Achievements.getAchievements()) {
      const achievementProgressId = `${userId}->${achievement.id}`;
      if (this.elements.has(achievementProgressId)) {
        userProgressOnAllAchievements[achievement.id] = await this.getElement(achievementProgressId);
      } else {
        userProgressOnAllAchievements[achievement.id] = 0;
      }
    }

    return userProgressOnAllAchievements;
  }
}