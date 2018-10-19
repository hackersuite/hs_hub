# Cache
The cache is used to speed up the load times of semi-static resources.
Currently cached resources:
 - Users (used only as an example)
  
## Using the cache
 ### Creating a model for the cache:
 - Create a class for the object that inherits `CacheObject`
 - Implement the `sync()` method and declare any necessary instance variables or methods, object expiration time can be defined by declaring a `protected  expiresIn:  number` (set to 10000 milliseconds by default)
 - Create a class for a collection of the objects that inherits `CacheCollection`
 - Implement the `sync()` method for the collection and declare any necessary instance variables or methods, collection expiration time can be defined by declaring a `protected  expiresIn:  number` (set to 10000 milliseconds by default)
 - Create a static variable for the collection in the `Cache` class in cache.ts
 - Add tests

### Retrieving an object from the cache:
 - Import the `Cache` class from cache.ts
 - Call the getElement(id) method on the required cache collection (don't forget to await the method call)

### Storing an object in the cache:
 - Import the `Cache` class from cache.ts
 - Call the `storeElement(element)` method on the required cache collection

### Removing an object from the cache:
 - Import the `Cache` class from cache.ts
 - Call the `removeElement(id)` method on the required cache collection