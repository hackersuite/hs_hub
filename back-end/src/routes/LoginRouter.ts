import { Router } from "express";

// Importing the controller
import { LoginController } from "../controllers";

/**
 * A router for handling the sign in of a user
 */
export const LoginRouter = (): Router => {
  // Initializing the router
  const router = Router();
  const loginController = new LoginController();

  /**
   * POST /login
   */
  router.post("/login", loginController.login);

  return router;
};
