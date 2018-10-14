/**
 * Abstract class for all objects stored in the cache
 */
export abstract class CacheObject {
  /**
   * The id of the object in the database
   */
  public id: string;
  /**
   * The amount of time the object stays synced (miliseconds).
   * The expiration duration is set to 10 seconds by default.
   * If this is set to a negative value, the object will never expire.
   */
  protected expiresIn: number = 10000;
  /**
   * The date when the object was last synced
   */
  protected syncedAt: Date;

  /**
   * Creates a new basic cache object
   * @param id The id of the object in the database
   */
  constructor(id) {
    this.id = id;
    this.syncedAt = new Date();
  }

  /**
   * Checks if the object is expired and syncs it if necessary,
   * then returns this cached object
   */
  public async get(): Promise<CacheObject> {
    if (this.isExpired()) {
      await this.sync();
    }
    return this;
  }

  /**
   * Checks if the object is expired and needs syncing
   */
  public isExpired(): boolean {
    return this.syncedAt == undefined || // Object has not been initialized yet
      this.expiresIn < 0 || // Object is set to never expire
      Date.now() > this.syncedAt.getTime() + this.expiresIn; // Object is expired
  }
  /**
   * Syncs the object with the database
   */
  public abstract async sync(): Promise<void>;
}