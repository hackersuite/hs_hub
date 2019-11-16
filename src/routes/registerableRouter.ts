import * as express from "express";

/**
 * In order to add a new route for requests, make sure you have done the following:
 * 1. Create a new class that implements this interface and has the `@injectable()` annotation
 * 2. Use constructor injection to inject the controller for the router
 * 3. Add the path from root for the request in the `getPathRoot()` function
 * 4. Add all the route handlers in the `register` function
 * 5. Finally, link to the inversify container using `container.bind<IRouter>(TYPES.Router).to(yourNewRouter);` in inversify.config.ts
 * 6. Create your `@injectable()` controller!
 */
export interface RouterInterface {
  /**
   * The initial route for requests to intercept in the router
   */
  getPathRoot(): string;

  /**
   * Router setup function that registers all the routes
   */
  register(): express.Router;
}
