import { Router } from "express";
import { checkIsOrganizer } from "../util/user";
import { AnnouncementController } from "../controllers";

export const announcementRouter = (): Router => {
  // Initialize router
  const router = Router();

  const announcementController = new AnnouncementController();

  /**
   * POST /announcement/
   */
  router.post("/", announcementController.announce);

  return router;
};