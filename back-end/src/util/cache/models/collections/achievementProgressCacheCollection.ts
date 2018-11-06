import { AchievementProgressCached } from "../objects/achievementProgressCached";
import { CacheCollection } from "../../abstract-classes";
import { AchievementProgress, User } from "../../../../db/entity/hub";
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
   * Gets the user's progress on given achievement
   * @param user The user
   * @param achievementId The achievement
   */
  public async getElementForUser(user: User, achievementId: string) {
    const elementId = `${user.id}->${achievementId}`;
    return await this.getElement(elementId);
  }

  /**
   * Syncs the progress of all achievements with the database
   */
  public async sync(): Promise<void> {
    // Fetching the achievement progress objects from the database
    const achievementsProgressObjects: AchievementProgress[] = await getConnection("hub")
      .getRepository(AchievementProgress)
      .createQueryBuilder("achievementProgress")
      .leftJoinAndSelect("achievementProgress.user", "user")
      .getMany();
    // Updating the instance variables\
    this.syncedAt = Date.now();
    this.elements = new Map<string, AchievementProgressCached>();
    achievementsProgressObjects.forEach((achievementProgress: AchievementProgress) => {
      const syncedAchievementProgress =
        new AchievementProgressCached(achievementProgress);
      // TODO: should probably have a method that generates an id for the object
      const elementId = `${syncedAchievementProgress.user.id}->${syncedAchievementProgress.achievement.id}`;
      this.elements[elementId] = syncedAchievementProgress;
    });
  }

  /**
   * Syncs a user's progress on all achievements.
   * Faster than syncing each object separately as it uses a batch DB query.
   * @param user The user to sync the achievements progress for
   */
  public async syncForUser(user: User): Promise<void> {
    // Finding the objects that need to be synced
    const achievementsProgressToSync: string[] = [];
    Achievements.getAchievements().forEach((achievement: Achievement) => {
      const achievementProgressId = `${user.id}->${achievement.id}`;
      if (!this.elements.has(achievementProgressId) ||
        this.elements[achievementProgressId].isExpired()) {
        achievementsProgressToSync.push(achievement.id);
      }
    });

    if (achievementsProgressToSync.length == 0) {
      return; // Preventing the DB query from being sent if nothing needs updating
    }

    // Sending a query for the new data
    const achievementsProgressForUser = await getConnection("hub")
      .getRepository(AchievementProgress)
      .createQueryBuilder("achievementProgress")
      .leftJoinAndSelect("achievementProgress.user", "user")
      .where("achievementProgress.userId = :userId", { userId: user.id })
      .andWhere("achievementProgress.achievementId IN (:achievementsProgressToSync)", { achievementsProgressToSync })
      .getMany();

    // Updating the collection
    achievementsProgressForUser.forEach((achievementProgress: AchievementProgress) => {
      const syncedAchievementProgress =
        new AchievementProgressCached(achievementProgress);
      // REVIEW: refactor to use storeElement()
      const elementId = `${syncedAchievementProgress.user.id}->${syncedAchievementProgress.achievement.id}`;
      this.elements[elementId] = syncedAchievementProgress;
    });
  }

  /**
   * Returns the user's progress on all implemented achievements
   * @param user The user
   */
  public async getUserProgressForAllAchievements(user: User): Promise<Map<string, number>> {
    // Batch updating the user's progress in the cache
    await this.syncForUser(user);

    // Extracting the data from the cache
    const userProgressOnAllAchievements = new Map<string, number>();
    for (const achievement of Achievements.getAchievements()) {
      const achievementProgressId = `${user.id}->${achievement.id}`;
      if (this.elements[achievementProgressId] !== undefined) {
        userProgressOnAllAchievements[achievement.id] = (await this.getElement(achievementProgressId)).progress;
      } else {
        userProgressOnAllAchievements[achievement.id] = 0;
      }
    }

    return userProgressOnAllAchievements;
  }
}