import { Router } from "express";
import { userRouter, homeRouter, achievementsRouter } from "./";

/**
 * Top-level router for the app
 */
export const mainRouter = (): Router => {
  const router = Router();

  // Requests to /user/*
  router.use("/user/", userRouter());

  // Requests to /achievements/*
  router.use("/achievements/", achievementsRouter());

  // Requests to /*
  router.use("/", homeRouter());

  return router;
};