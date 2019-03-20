import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn, checkIsVolunteer } from "../util/user/authorization";

export const homeRouter = (): Router => {
  const router = Router();

  const homeController = new HomeController();

  router.get("/login",
    homeController.login);

  router.get("/achievements",
    checkIsLoggedIn,
    homeController.achievements);

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