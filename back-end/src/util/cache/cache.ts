import { UsersCacheCollection, EventsCacheCollection } from "./models/collections";

/**
 * The top-level interface for the cache
 */
export abstract class Cache {
  /**
   * The cached users collection
   */
  public static users: UsersCacheCollection = new UsersCacheCollection();
  public static events: EventsCacheCollection = new EventsCacheCollection();

}