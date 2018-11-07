import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn, checkIsVolunteer } from "../util/user/authorization";

export const homeRouter = (): Router => {
  const router = Router();

  const homeController = new HomeController();

  router.get("/dashboard",
  // checkIsLoggedIn,
  homeController.dashboard);

  router.get("/admin",
  // checkIsVolunteer,
  homeController.admin);

  return router;
};