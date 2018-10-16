import { CacheObject } from "./cacheObject";

/**
 * Abstract class for a collection of objects in the cache
 * @param T The type of objects to store in the collection
 */
export abstract class CacheCollection<T extends CacheObject> extends CacheObject {
  /**
   * Array containing all elements in the collection
   */
  public elements: Map<number, T>;

  /**
   * Creates a collection for cached objects
   */
  constructor() {
    super(0);
    // super.expiresIn = this.expiresIn;
  }

  /**
   * Gets an element of the collection with the specified id
   * returns undefined if no object with given id is found
   * @param id The id of the requested element
   */
  public async getElement(id: number): Promise<T> {
    if (this.isExpired()) {
      await this.sync();
    }
    if (this.elements[id] != undefined) {
      if (this.elements[id].isExpired()) {
        await this.elements[id].sync();
      }
      return this.elements[id] as T;
      // TODO: Should try to sync object if not found
    } else {
      return undefined;
    }
  }
}