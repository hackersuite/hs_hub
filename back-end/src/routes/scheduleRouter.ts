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
  router.post("/create", checkIsOrganizer, scheduleController.createEvent);

  /**
   * POST /schedule/delete
   */
  router.get("/delete", checkIsOrganizer, scheduleController.deleteEvent);


  /**
   * GET /schedule/*
   */
  router.get("/", scheduleController.listEvents);

  return router;
};
