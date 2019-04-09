/**
 * Interface for an object stored in a memory cache
 */
export interface Cacheable {
  /**
   * The unique id of the object
   */
  id: number;

  /**
   * Unix time in milliseconds at which the object was last synced
   */
  syncedAt?: number;

  /**
   * Unix time in milliseconds for the cache lifetime of the object.
   * Setting to a negative value will result in an infinite lifetime
   */
  expiresIn: number;
}