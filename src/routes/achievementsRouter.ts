import { Router } from "express";
import { AchievementsController } from "../controllers/";
import { checkIsLoggedIn, checkIsOrganizer, checkIsVolunteer } from "../util/user";
import { AchievementsService, AchievementsProgressService } from "../services/achievements";
import { LocalAchievementsRepository } from "../util/achievements/localAchievementsRepository";
import { localAchievements } from "../util/achievements/localAchievements";
import { getConnection } from "typeorm";
import { AchievementProgress, User } from "../db/entity/hub";
import { UserService } from "../services/users";

export const achievementsRouter = (): Router => {
  const achievementsService: AchievementsService =
    new AchievementsService(new LocalAchievementsRepository(localAchievements));

  const achievementsProgressService: AchievementsProgressService =
    new AchievementsProgressService(getConnection("hub").getRepository(AchievementProgress), achievementsService);

  const userService: UserService = new UserService(getConnection("hub").getRepository(User));

  const router = Router();
  const achievementsController = new AchievementsController(achievementsService, achievementsProgressService, userService);

  /**
   * GET /achievements
   * Returns all implemented achievements
   */
  router.get("/", checkIsLoggedIn, achievementsController.getAchievementsPage);


  /**
   * GET /achievements/volunteercontrols
   * Returns all implemented achievements
   */
  router.get("/volunteercontrols",
  checkIsVolunteer,
  achievementsController.getVolunteersPage);

  /**
   * GET /achievements/progress
   * Returns the user's progress on all achievements
   */
  router.get("/progress", checkIsLoggedIn, achievementsController.getProgressForAllAchievements);

  /**
   * GET /achievements/:id/progress
   * Returns the user's progress on a specific achievement
   */
  router.get("/:id/progress", checkIsLoggedIn, achievementsController.getProgressForAchievement);

  /**
   * PUT /achievements/:id/complete
   * Sets the user's progress on the achievement to completed
   */
  router.put("/:id/complete",
    checkIsVolunteer,
    achievementsController.completeAchievementForUser);

  /**
   * GET /achievements/:id/step/:step?token=:token
   * Increments the user's progress on a specific achievement
   */
  router.get("/:id/step/:step", checkIsLoggedIn, achievementsController.completeAchievementStep);

  /**
   * PUT /achievements/:id/complete
   * Sets the user's prizeClaimed on the achievement to true
   */
  router.put("/:id/giveprize",
    checkIsVolunteer,
    achievementsController.givePrizeToUser);

  /**
   * PUT /achievements/:id/complete
   * Sets the user's prizeClaimed on the achievement to true
   */
  router.get("/token/:id/:step",
    checkIsOrganizer,
    achievementsController.getAchievementToken);

  return router;
};