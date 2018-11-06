import { Router } from "express";
import { HomeController } from "../controllers";

export const homeRouter = (): Router => {
  const router = Router();

  const homeController = new HomeController();

  router.get("/", homeController.login);

  return router;
};