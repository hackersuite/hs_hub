import { Router } from "express";
import { userRouter, homeRouter } from "./";

export const mainRouter = (): Router => {
  const router = Router();

  router.use("/", homeRouter());
  router.use("/user/", userRouter());

  return router;
};