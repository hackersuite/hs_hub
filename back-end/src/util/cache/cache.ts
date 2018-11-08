import { UsersCacheCollection, EventsCacheCollection, ChallengesCacheCollection, AchievementProgressCacheCollection } from "./models/collections";

/**
 * The top-level interface for the cache
 */
export abstract class Cache {
  /**
   * The cached users collection
   */
  public static users: UsersCacheCollection = new UsersCacheCollection();
  public static achievementsProgess: AchievementProgressCacheCollection = new AchievementProgressCacheCollection();
  public static events: EventsCacheCollection = new EventsCacheCollection();
  public static challenges: ChallengesCacheCollection = new ChallengesCacheCollection();
}
