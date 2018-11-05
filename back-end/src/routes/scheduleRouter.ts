import { Router } from "express";
import { UserController } from "../controllers/userController";
import { checkIsLoggedIn, checkIsVolunteer, checkIsOrganizer } from "../util/user";
import { ScheduleController } from "../controllers";


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
   * POST /schedule/update
   */
  router.get("/update", checkIsOrganizer, scheduleController.updateEvent);


  /**
   * GET /schedule/*
   */
  router.get("/", scheduleController.listEvents);

  return router;
};
