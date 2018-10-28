import { UsersCacheCollection } from "./models/collections";
import { AchievementProgressCacheCollection } from "./models/collections/achievementProgressCacheCollection";

/**
 * The top-level interface for the cache
 */
export abstract class Cache {
  /**
   * The cached users collection
   */
  public static users: UsersCacheCollection = new UsersCacheCollection();

  public static achievementsProgess: AchievementProgressCacheCollection = new AchievementProgressCacheCollection();
}