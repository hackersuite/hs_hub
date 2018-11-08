import { Router } from "express";
import { userRouter, homeRouter, hardwareRouter, scheduleRouter,
         challengesRouter, achievementsRouter } from "./";

/**
 * Top-level router for the app
 */
export const mainRouter = (): Router => {
  const router = Router();

  // Requests to /hardware/*
  router.use("/hardware/", hardwareRouter());

  // Requests to /user/*
  router.use("/user/", userRouter());

  // Requests to /achievements/*
  router.use("/achievements/", achievementsRouter());

  // Requests to /schedule/*
  router.use("/schedule/", scheduleRouter());

  // Requests to /challenge/*
  router.use("/challenges/", challengesRouter());

  // Requests to /*
  router.use("/", homeRouter());

  return router;
};
