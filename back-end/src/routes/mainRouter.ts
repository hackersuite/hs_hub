import { Router } from "express";
import { userRouter, homeRouter, scheduleRouter } from "./";

/**
 * Top-level router for the app
 */
export const mainRouter = (): Router => {
  const router = Router();

  // Requests to /user/*
  router.use("/user/", userRouter());

  // Requests to /schedule/*
  router.use("/schedule/", scheduleRouter());

  // Requests to /*
  router.use("/", homeRouter());

  return router;
};