import { Cacheable } from "./";
import { CacheInterface } from "./cacheInterface";
/**
 * Class for a memory cache that stores objects with interface Cacheable
 */
export class Cache implements CacheInterface {
  /**
   * The container for all items in the cache.
   * The 1st level key is the name of the class of the stored object.
   * The 2nd level key is the id of the stored object
   */
  private items: Map<string, Map<number, Cacheable>>;

  /**
   * Creates an in-memory cache.
   * @param preloadedItems A map of pre-loaded items for the cache.
   * 1st level key is the name of the collection and the 2nd level key
   * is the id of the object.
   */
  constructor(preloadedItems?: Map<string, Map<number, Cacheable>>) {
    this.items = preloadedItems || new Map<string, Map<number, Cacheable>>();
    this.get = this.get.bind(this);
    this.getAll = this.getAll.bind(this);
    this.set = this.set.bind(this);
    this.setAll = this.setAll.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.objectIsExpired = this.objectIsExpired.bind(this);
  }

  /**
   * Fetches an object from the cache. Returns undefined if no object could be found
   * @param className The name of the class of the stored object
   * @param id The id of the object
   */
  public get<T extends Cacheable>(className: string, id: number): T {
    const selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection)
      return undefined;

    const selectedElement: Cacheable = selectedCollection.get(id);
    if (!selectedElement || this.objectIsExpired(selectedElement)) {
      selectedCollection.delete(id);
      return undefined;
    } else {
      return selectedElement as T;
    }
  }

  /**
   * Fetches all objects in the cache of the given class
   * Returns empty array if no objects could be found
   * @param className The class of the objects to fetch
   */
  public getAll<T extends Cacheable>(className: string): T[] {
    const selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection)
      return [];

    const resultArray: T[] = [];
    const collectionIterator: IterableIterator<Cacheable> = selectedCollection.values();
    let iteratorResult: IteratorResult<Cacheable> = collectionIterator.next();

    // Converting an iterator to an array and removing expired objects
    while (!iteratorResult.done) {
      const currentElement: Cacheable = iteratorResult.value;

      if (this.objectIsExpired(currentElement)) {
        selectedCollection.delete(currentElement.id);
      } else {
        resultArray.push(currentElement as T);
      }

      iteratorResult = collectionIterator.next();
    }

    return resultArray;
  }

  /**
   * Stores an object in the cache.
   * Resets the object's cache lifetime.
   * @param className The name of the class of the object to be stored
   * @param obj The object to be stored
   */
  public set(className: string, obj: Cacheable): void {
    let selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection) {
      this.items.set(className, new Map<number, Cacheable>());
      selectedCollection = this.items.get(className);
    }

    obj.syncedAt = Date.now();
    selectedCollection.set(obj.id, obj);
  }

  /**
   * Stores an array of objects in the cache.
   * Resets the cache lifetime of the objects.
   * All new objects will have an identical cache lifetime.
   * @param className The name of the class of the objects to be stored
   * @param objects The objects to be stored
   */
  public setAll(className: string, objects: Cacheable[]): void {
    let selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection) {
      this.items.set(className, new Map<number, Cacheable>());
      selectedCollection = this.items.get(className);
    }

    const syncTime: number = Date.now();

    objects.forEach((obj: Cacheable) => {
      obj.syncedAt = syncTime;
      selectedCollection.set(obj.id, obj);
    });
  }

  /**
   * Deletes an object from the cache
   * @param className The name of the class of the object to be deleted
   * @param obj The object to be deleted
   */
  public delete(className: string, id: number): void {
    const selectedCollection: Map<number, Cacheable> = this.items.get(className);

    if (!selectedCollection)
      return;

    selectedCollection.delete(id);
  }

  /**
   * Deletes all objects of given class from the cache
   * @param className The name of the class of the objects to be deleted
   */
  public deleteAll(className: string): void {
    this.items.delete(className);
  }

  /**
   * Checks wether the given Cacheable object is expired
   * @param obj The object
   */
  private objectIsExpired(obj: Cacheable): boolean {
    if (obj.expiresIn < 0)
      return false;
    return obj.syncedAt + obj.expiresIn <= Date.now();
  }
}