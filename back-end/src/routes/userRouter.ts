import { Router } from "express";
import { UserController } from "../controllers/userController";
import { checkIsLoggedIn, checkIsVolunteer, checkIsOrganizer } from "../util/user";

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
   * GET /user/checkVolunteer
   * Used only to test out checkIsVolunteer, to be removed in next pull request
   */
  router.get("/checkVolunteer", checkIsVolunteer, userController.test);

  /**
   * GET /user/checkOrganizer
   * Used of only to test out checkIsOrganizer, to be removed in next pull request
   */
  router.get("/checkOrganizer", checkIsOrganizer, userController.test);

  /**
   * GET /user/checkAttendee
   * Used of only to test out checkIsLoggedIn, to be removed in next pull request
   */
  router.get("/checkAttendee", checkIsLoggedIn, userController.test);

  /**
   * GET /user/logout
   */
  router.get("/logout", checkIsLoggedIn, userController.logout);

  return router;
};
