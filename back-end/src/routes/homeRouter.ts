import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn } from "../util/user/authorization";

export const homeRouter = (): Router => {
  const router = Router();

  const homeController = new HomeController();

  router.get("/dashboard",
  // checkIsLoggedIn,
  homeController.dashboard);

  return router;
};