/**
 * Abstract class for all objects stored in the cache
 */
export abstract class CacheObject {
  /**
   * The id of the object in the database
   */
  public id: string;
  /**
   * The amount of time the object stays synced (miliseconds)
   */
  protected expiresIn: number;
  /**
   * The date when the object was last synced
   */
  protected syncedAt: Date;

  /**
   * Checks if the object is expired and needs syncing
   */
  public isExpired(): boolean {
    return Date.now() > this.syncedAt.getTime() + this.expiresIn;
  }
  /**
   * Syncs the object with the database
   */
  public abstract sync();

  /**
   * Creates a new basic cache object
   */
  constructor() {
    this.syncedAt = new Date();
  }
}