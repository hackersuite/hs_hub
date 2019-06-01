import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn } from "../util/user/authorization";
import { AnnouncementService } from "../services/announcement";
import { Announcement, Event, Challenge } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { EventService } from "../services/events";
import { ChallengeService } from "../services/challenges";
import { Cache } from "../util/cache";

export const homeRouter = (cache: Cache): Router => {
  const announcementService: AnnouncementService = new AnnouncementService(
    getConnection("hub").getRepository(Announcement), cache
  );
  const eventService: EventService = new EventService(
    getConnection("hub").getRepository(Event)
  );
  const challengeService: ChallengeService = new ChallengeService(
    getConnection("hub").getRepository(Challenge)
  );

  const router = Router();
  const homeController = new HomeController(cache, announcementService, eventService, challengeService);

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