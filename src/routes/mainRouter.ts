import { Router } from "express";
import {
  userRouter, homeRouter, hardwareRouter, scheduleRouter,
  challengesRouter, achievementsRouter, teamRouter, announcementRouter
} from "./";
import { Cache } from "../util/cache";

/**
 * Top-level router for the app
 */
export const mainRouter = (): Router => {
  const router = Router();
  const cache = new Cache();

  router.use((req, res, next) => {
    if (req.get("X-Forwarded-Proto") !== "https" && process.env.USE_SSL) {
      res.redirect("https://" + req.headers.host + req.url);
    } else {
      return next();
    }
  });

  // Requests to /hardware/*
  router.use("/hardware/", hardwareRouter());

  // Requests to /user/*
  router.use("/user/", userRouter());

  // Requests to /achievements/*
  router.use("/achievements/", achievementsRouter());

  // Requests to /schedule/*
  router.use("/schedule/", scheduleRouter(cache));

  // Requests to /team/*
  router.use("/team/", teamRouter());

  // Requests to /challenge/*
  router.use("/challenges/", challengesRouter(cache));

  // Requests to /announcement/*
  router.use("/announcement/", announcementRouter());

  // Requests to /*
  router.use("/", homeRouter());

  return router;
};