import { Router } from "express";
import { userRouter, homeRouter, hardwareRouter } from "./";

/**
 * Top-level router for the app
 */
export const mainRouter = (): Router => {
  const router = Router();

  // Requests to /hardware/*
  router.use("/hardware/", hardwareRouter());

  // Requests to /user/*
  router.use("/user/", userRouter());

  // Requests to /*
  router.use("/", homeRouter());

  return router;
};