import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn, checkIsVolunteer } from "../util/user/authorization";

export const homeRouter = (): Router => {
  const router = Router();

  const homeController = new HomeController();

  router.get("/admin",
    checkIsVolunteer,
    homeController.admin);

  router.get("/login",
    homeController.login);

  router.get("/hardware",
    checkIsLoggedIn,
    homeController.hardware);

  router.get("/achievements",
    checkIsLoggedIn,
    homeController.achievements);

  router.get("/contacts",
    checkIsLoggedIn,
    homeController.contacts);


  router.get("/",
    checkIsLoggedIn,
    homeController.dashboard);

  return router;
};