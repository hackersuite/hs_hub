import { Router } from "express";

// Importing the controller
import { TestController } from "../controllers";

/**
 * A template router
 */
export const TestRouter = (): Router => {
  // Initializing the router
  const router = Router();
  const testController = new TestController();

  /**
   * GET /
   */
  router.get("/", testController.index);

  /**
   * GET /email
   */
  router.get("/email", testController.email);

  /**
   * GET /:name
   */
  router.get("/:name", testController.name);

  /**
   * POST /password
   */
  router.post("/password", testController.password);

  return router;
};
