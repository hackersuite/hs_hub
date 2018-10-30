import { Router } from "express";
import { UserController } from "../controllers/userController";
import { checkIsLoggedIn, checkIsVolunteer, checkIsOrganizer } from "../util/user";
import { ScheduleController } from "../controllers";

// get(/schedule) -> returns all the events
// post(/schedule/creat) -> to create and event done
// put (/schedule/update) -> to update event
// delte(/schedule/delete) -> to delete and event


/**
 * A router for handling the sign in of a user
 */
export const scheduleRouter = (): Router => {
  // Initializing the router
  const router = Router();

  const scheduleController = new ScheduleController();

  /**
   * POST /schedule/creat
   */
  router.post("/create", scheduleController.createEvent);

  /**
   * GET /user/checkVolunteer
   * Used only to test out checkIsVolunteer, to be removed in next pull request
   */
  // router.get("/checkVolunteer", checkIsVolunteer, userController.test);

  /**
   * GET /user/checkOrganizer
   * Used of only to test out checkIsOrganizer, to be removed in next pull request
   */
  // router.get("/checkOrganizer", checkIsOrganizer, userController.test);

  /**
   * GET /user/checkAttendee
   * Used of only to test out checkIsLoggedIn, to be removed in next pull request
   */
  // router.get("/checkAttendee", checkIsLoggedIn, userController.test);

  /**
   * GET /user/logout
   */
  // router.get("/logout", checkIsLoggedIn, userController.logout);

  return router;
};
