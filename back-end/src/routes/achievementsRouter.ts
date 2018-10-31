import { Router } from "express";
import { AchievementsController } from "../controllers/achievementsController";
import { checkIsLoggedIn } from "../util/user";

export const achievementsRouter = (): Router => {
  const router = Router();
  const achievementsController = new AchievementsController();

  /**
   * GET /achievements
   * Returns all implemented achievements
   */
  router.get("/", achievementsController.getAllAchievements);

  /**
   * GET /achievements/progress
   * Returns the user's progress on all achievements
   */
  router.get("/progress", checkIsLoggedIn, achievementsController.getProgressForAllAchievements);

  /**
   * GET /achievements/:achievementId/progress
   * Returns the user's progress on a specific achievement
   */
  router.get("/:achievementId/progress", checkIsLoggedIn, achievementsController.getProgressForAchievement);

  /**
   * POST /achievements/:achievementId/incrementProgress
   * Increments the user's progress on a specific achievement
   */
  router.post("/:achievementId/incrementProgress", checkIsLoggedIn, achievementsController.incrementProgressForAchievement);

  return router;
};