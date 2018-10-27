import { Router } from "express";
import { userRouter, homeRouter } from "./";

/**
 * Top-level router for the app
 */
export const mainRouter = (): Router => {
  const router = Router();

  // Requests to /user/*
  router.use("/user/", userRouter());

  // Requests to /*
  router.use("/", homeRouter());

  return router;
};