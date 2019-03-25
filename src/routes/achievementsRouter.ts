import { Router } from "express";
import { AchievementsController } from "../controllers/";
import { checkIsLoggedIn, checkIsOrganizer } from "../util/user";
import { AchievementsService, AchievementsProgressService } from "../services";
import { LocalAchievementsRepository } from "../util/achievements/localAchievementsRepository";
import { localAchievements } from "../util/achievements/localAchievements";
import { getRepository } from "typeorm";
import { AchievementProgress } from "../db/entity/hub";

export const achievementsRouter = (): Router => {
  const achievementsService: AchievementsService =
    new AchievementsService(new LocalAchievementsRepository(localAchievements));

  const achievementsProgressService: AchievementsProgressService =
    new AchievementsProgressService(getRepository(AchievementProgress), achievementsService);

  const router = Router();
  const achievementsController = new AchievementsController(achievementsService, achievementsProgressService);

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

  // /**
  //  * GET /achievements/:achievementId/progress
  //  * Returns the user's progress on a specific achievement
  //  */
  // router.get("/:achievementId/progress", checkIsLoggedIn, achievementsController.getProgressForAchievement);

  // /**
  //  * POST /achievements/:achievementId/incrementProgress
  //  * Increments the user's progress on a specific achievement
  //  */
  // router.post("/:achievementId/incrementProgress", checkIsLoggedIn, achievementsController.incrementProgressForAchievement);

  // /**
  //  * POST /achievements/:achievementId/setProgress
  //  * Sets a users progress to a given value
  //  */
  // router.post("/:achievementId/setProgress", checkIsOrganizer, achievementsController.setUserProgressForAchievement);

  return router;
};