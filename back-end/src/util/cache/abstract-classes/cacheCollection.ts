import { CacheObject } from "./cacheObject";

/**
 * Abstract class for a collection of objects in the cache
 * @param T The type of objects to store in the collection
 */
export abstract class CacheCollection<T extends CacheObject> extends CacheObject {
  /**
   * Array containing all elements in the collection
   */
  private elements: Map<string, T>;

  /**
   * Gets an element of the collection with the specified id
   * returns undefined if no object with given id is found
   * @param id The id of the requested element
   */
  public getElement(id: string): T {
    if (this.elements.has(id)) {
      return this.elements[id];
    } else {
      return undefined;
    }
  }
}