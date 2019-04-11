import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn } from "../util/user/authorization";
import { AnnouncementService } from "../services/announcement";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";

export const homeRouter = (): Router => {
  const announcementService: AnnouncementService = new AnnouncementService(
    getConnection("hub").getRepository(Announcement)
  );

  const router = Router();
  const homeController = new HomeController(announcementService);

  router.get("/login",
    homeController.login);

  router.get("/contacts",
    checkIsLoggedIn,
    homeController.contacts);

  router.get("/challenges",
    checkIsLoggedIn,
    homeController.challenges);

  router.get("/",
    checkIsLoggedIn,
    homeController.dashboard);

  return router;
};