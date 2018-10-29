import { Request, Response } from "express";
import { Achievements } from "../util/achievements";
import { NextFunction } from "connect";

/**
 * A controller for the achievements methods
 */
export class AchievementsController {
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
}