import { Cacheable } from "./cacheable";

export interface CacheInterface {
  get<T extends Cacheable>(className: string, id: number): T;
  getAll<T extends Cacheable>(className: string): T[];
  set(className: string, obj: Cacheable): void;
  setAll(className: string, objects: Cacheable[]): void;
  delete(className: string, id: number): void;
  deleteAll(className: string): void;
}
