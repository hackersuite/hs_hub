import { Cacheable } from "./";

/**
 * Class for a memory cache that stores objects with interface Cacheable
 */
export class Cache {
  /**
   * The container for all items in the cache.
   * The 1st level key is the name of the class of the stored object.
   * The 2nd level key is the id of the stored object
   */
  private items: Map<string, Map<number, Cacheable>> = new Map<string, Map<number, Cacheable>>();

  /**
   * Fetches an object from the cache. Returns undefined if no object could be found
   * @param className The name of the class of the stored object
   * @param id The id of the object
   */
  public get(className: string, id: number): Cacheable {
    const selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection)
      return undefined;

    return selectedCollection.get(id);
  }

  /**
   * Fetches all objects in the cache of the given class
   * @param className The class of the objects to fetch
   */
  public getAll(className: string): Cacheable[] {
    const selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection)
      return undefined;

    return Array.from(selectedCollection.values());
  }

  /**
   * Stores an object in the cache
   * @param className The name of the class of the object to be stored
   * @param obj The object to be stored
   */
  public set(className: string, obj: Cacheable): void {
    let selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection) {
      this.items.set(className, new Map<number, Cacheable>());
      selectedCollection = this.items.get(className);
    }

    selectedCollection.set(obj.id, obj);
  }

  /**
   * Stores an array of objects in the cache
   * @param className The name of the class of the objects to be stored
   * @param objects The objects to be stored
   */
  public setAll(className: string, objects: Cacheable[]): void {
    let selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection) {
      this.items.set(className, new Map<number, Cacheable>());
      selectedCollection = this.items.get(className);
    }

    objects.forEach((obj: Cacheable) => {
      selectedCollection.set(obj.id, obj);
    });
  }
}