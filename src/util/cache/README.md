
# Cache
An in-memory cache implemented using a cache-aside architecture.
 ## Structure of the cache
 The cache stores objects that implement the interface `Cacheable`.
 
 All objects in the cache a separated into different collections depending on the name of their class.
 
 The cache has a single container object for all items stored in the cache. This object is of type `Map<string, Map<number, Cacheable>` where the string key is the name of collection for that object (the class name of the object) and the number key is the id of the object defined in the interface `Cacheable`.
 
 The cache has 3 types of data access functions:
  - Read: `get` and `getAll`
  - Set/Update: `set` and `setAll`
  - Delete: `delete` and `deleteAll`
## Using the cache
### Preparing an object to be stored in the cache
In order to store an object in the cache, it must implement the interface `Cacheable`. It can be implemented by defining 2 fields in the class of the object to be stored:
 - `id: number` : The id of the object in the cache. **Must be unique** 
 - `expiresIn: number` : The number of milliseconds after which the object is considered to be expired and needs to be re-synced with the cache.

> Note: the developer does not need to define the syncedAt field of the Cacheable interface as this is handled by the `Cache` object.

### Initializing the cache
The cache can be initialized by calling the constructor on the class `Cache`. The constructor also allows the developer to pre-load some items to the cache.

> Note: the `syncedAt` field on any pre-loaded objects must be set manually, otherwise the objects will not expire.

### Storing an object(s) in the cache:
An object can be stored in the cache by using the function `set(className, id)` in the Cache class where `className` is the name of the class of the object to be stored (if we had a class `Event`, `className` would be set to `Event.name`) and `id` is the id object defined in the interface `Cacheable`.
The function `setAll(className, objects)` allows storing an array of objects to the cache.

> Note: all objects stored with a single `setAll(...)` call will expire at the same time (if their `expiresIn` field has the same value). This is useful when the lifetime of all objects within a collection has to be the same. For example: when caching a schedule, either all events should be in the cache or none at all as otherwise an incorrect schedule will returned.

### Retrieving an object from the cache:
An object in the cache can be retrieved by calling the `get<T>(className, id)` function where `T` is the class of the object to be retrieved (e.g.: `Event`), `className` is the name of the class of the object to be returned (e.g.: `Event.name`, this needs to be specified separate from `T` because of the way TypeScript deals with types, at run-time the app is running in JavaScript and because of that the class name cannot be retrieved dynamically) and `id` is the id of the object in the cache.
`get<T>(className` can be used to retrieve all objects of the same class.

> Note: when calling the `get` functions, the generic parameter may be omitted if the type of the variable in which the result is stored is specified explicitly (e.g.: `let events: Event[] = cache.getAll(Event.name);`).

### Removing an object from the cache:

**Expired objects are removed from the cache automatically.**
Other objects can be removed by calling the function `delete(className, id)` where `className` is the name of the class of the object to be removed (e.g: `Event.name`) and `id` is the id of the object in the cache defined in the interface `Cacheable`.
All objects of a single class can removed by using the function `deleteAll(className)`.