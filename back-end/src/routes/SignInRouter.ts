import { Router } from "express";

// Importing the controller
import { SignInController } from "../controllers";

/**
 * A router for handling the sign in of a user
 */
export const SignInRouter = (): Router => {
  // Initializing the router
  const router = Router();
  const signInController = new SignInController();

  /**
   * POST /signin
   */
  router.post("/signin", signInController.signin);

  return router;
};
