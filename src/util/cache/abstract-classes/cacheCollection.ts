import { CacheObject } from "./cacheObject";


/**
 * Abstract class for a collection of objects in the cache
 * @param T The type of objects to store in the collection
 */
export abstract class CacheCollection<T extends CacheObject> extends CacheObject {
  /**
   * Array containing all elements in the collection
   */
  public elements: Map<string, T>;

  /**
   * Specifies if the collection has been initialized (synced for the first time)
   */
  private isInitialized: boolean = false;

  /**
   * Creates a collection for cached objects
   */
  constructor() {
    super("collection");
    this.elements = new Map<string, T>();
  }

  /**
   * Stores an element in the collection.
   * If an element with the same id already exists, it gets overwritten.
   * @param element The element to be stored in the collection
   */
  public storeElement(element: T): void {
    this.elements[element.id] = element;
  }

  /**
   * Removes an element from the collection, if given element is in collection
   * @param element The element to be removed from the collection
   */
  public removeElement(id: string): void {
    if (this.elements[id] === undefined) {
      return; // Element does not exist in collection
    }
    delete this.elements[id];
  }

  public async getElements(): Promise<T[]> {
    if (this.isExpired() || !this.isInitialized) {
      await this.sync();
      this.isInitialized = true;
    }
    const elementsArray: T[] = [];
    // REVIEW: very slow, should send a single batch-query
    for (const key in this.elements) {
      if (this.elements.hasOwnProperty(key)) {
        const element = this.elements[key];
        elementsArray.push(await this.getElement(element.id));
      }
    }
    return elementsArray;
  }

  /**
   * Gets an element of the collection with the specified id
   * returns undefined if no object with given id is found
   * @param id The id of the requested element
   */
  public async getElement(id: string): Promise<T> {
    if (this.isExpired() || !this.isInitialized) {
      await this.sync();
      this.isInitialized = true;
    }
    if (this.elements[id] !== undefined) {
      if (this.elements[id].isExpired()) {
        await this.elements[id].sync();
      }
      return this.elements[id];
    } else {
      return undefined;
    }
  }
}