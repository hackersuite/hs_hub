import { Request, Response } from "express";
import { Achievements } from "../util/achievements";
import { NextFunction } from "connect";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { User } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { Cache } from "../util/cache";

/**
 * A controller for the achievements methods
 */
export class AchievementsController {
  public getAllAchievements(req: Request, res: Response) {
    const achievements = Achievements.getAchievements();
    res.send(achievements);
  }

  public async getProgressForAllAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress: Map<string, number> = await Achievements.getUserProgressForAllAchievements(req.user);
      res.send(progress);
    } catch (err) {
      next(err);
    }
  }
  public async getProgressForAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress: number = await Achievements.getUserProgressForAchievement(req.user, req.params.achievementId);
      res.send(String(progress));
    } catch (err) {
      next(err);
    }
  }
  public async incrementProgressForAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress: number = await Achievements.incrementUserProgressForAchievement(
        req.user,
        req.params.achievementId,
        req.body.token,
        req.body.step
      );
      res.send(String(progress));
    } catch (err) {
      next(err);
    }
  }

  public async setUserProgressForAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, progress, steps } = req.body;
      const achievementId = req.params.achievementId;
      if (!userId || !achievementId || !progress) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "Not all parameters provided! Expected: achievementId, userId, progress");
      }
      const user: User = await getConnection("hub")
        .getRepository(User)
        .createQueryBuilder("user")
        .where("user.id = :userId", { userId })
        .getOne();
      if (!user) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "User with given id not found!");
      }
      const userProgressInCache = await Cache.achievementsProgess.getElementForUser(user, achievementId);
      const stepsCompleted = userProgressInCache ? userProgressInCache.stepsCompleted : "" + steps || "";
      const userProgress = await Achievements.getAchievementWithId(achievementId).updateUsersProgress(user, progress, stepsCompleted);
      res.send(userProgress);
    } catch (err) {
      next(err);
    }
  }
}