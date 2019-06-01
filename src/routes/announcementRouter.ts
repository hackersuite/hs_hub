import { Router } from "express";
import { checkIsOrganizer, checkIsLoggedIn } from "../util/user";
import { AnnouncementController } from "../controllers";
import { AnnouncementService } from "../services/announcement/announcementService";
import { getConnection } from "typeorm";
import { Announcement, User } from "../db/entity/hub";
import { UserService } from "../services/users";
import { Cache } from "../util/cache";

export const announcementRouter = (cache: Cache): Router => {
  const announcementService: AnnouncementService = new AnnouncementService(
    getConnection("hub").getRepository(Announcement), cache
  );
  const userService: UserService = new UserService(
    getConnection("hub").getRepository(User)
  );

  // Initialize router
  const router = Router();
  const announcementController = new AnnouncementController(announcementService, userService);

  /**
   * POST /announcement/
   */
  router.post("/",
    checkIsOrganizer,
    announcementController.announce);

  /**
   * POST /announcement/push
   */
  router.post("/push",
    checkIsOrganizer,
    announcementController.pushNotification);

  /**
   * POST /announcement/push/register
   */
  router.post("/push/register",
    checkIsLoggedIn,
    announcementController.pushNotificationRegister);

  return router;
};