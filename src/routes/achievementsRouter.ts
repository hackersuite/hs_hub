import { Router } from "express";
import { checkIsLoggedIn, checkIsOrganizer, checkIsVolunteer } from "../util/user";
import { RouterInterface } from ".";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { AchievementsController } from "../controllers";

@injectable()
export class AchievementsRouter implements RouterInterface {
  private _achievementsController: AchievementsController;

  public constructor(@inject(TYPES.AchievementsController) achievementsController: AchievementsController) {
    this._achievementsController = achievementsController;
  }

  public getPathRoot(): string {
    return "/achievements";
  }

  public register(): Router {
    const router: Router = Router();

    router.use(checkIsLoggedIn);

    /**
     * GET /achievements
     * Returns all implemented achievements
     */
    router.get("/", this._achievementsController.getAchievementsPage);


    /**
     * GET /achievements/volunteercontrols
     * Returns all implemented achievements
     */
    router.get("/volunteercontrols",
    checkIsVolunteer,
    this._achievementsController.getVolunteersPage);

    /**
     * GET /achievements/progress
     * Returns the user's progress on all achievements
     */
    router.get("/progress", this._achievementsController.getProgressForAllAchievements);

    /**
     * GET /achievements/:id/progress
     * Returns the user's progress on a specific achievement
     */
    router.get("/:id/progress", this._achievementsController.getProgressForAchievement);

    /**
     * PUT /achievements/:id/complete
     * Sets the user's progress on the achievement to completed
     */
    router.put("/:id/complete",
      checkIsVolunteer,
      this._achievementsController.completeAchievementForUser);

    /**
     * GET /achievements/:id/step/:step?token=:token
     * Increments the user's progress on a specific achievement
     */
    router.get("/:id/step/:step", this._achievementsController.completeAchievementStep);

    /**
     * PUT /achievements/:id/complete
     * Sets the user's prizeClaimed on the achievement to true
     */
    router.put("/:id/giveprize",
      checkIsVolunteer,
      this._achievementsController.givePrizeToUser);

    /**
     * PUT /achievements/:id/complete
     * Sets the user's prizeClaimed on the achievement to true
     */
    router.get("/token/:id/:step",
      checkIsOrganizer,
      this._achievementsController.getAchievementToken);

    return router;
  }
};