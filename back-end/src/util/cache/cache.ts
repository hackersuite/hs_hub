import { CacheCollection, CacheObject } from "./abstract-classes";

/**
 * The top-level interface for the cache
 */
export abstract class Cache {
  private static collections: Map<CacheCollections, CacheCollection<CacheObject>>;
}

export enum CacheCollections {
  TEST
}