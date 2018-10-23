import { Router } from "express";
import { UserController } from "../controllers/userController";

/**
 * A router for handling the sign in of a user
 */
export const userRouter = (): Router => {
  // Initializing the router
  const router = Router();

  const userController = new UserController();

  /**
   * POST /user/login
   */
  router.post("/login", userController.login);

  /**
   * GET /user/logout
   */
  router.get("/logout", userController.logout);

  return router;
};
