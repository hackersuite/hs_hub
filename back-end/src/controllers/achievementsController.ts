import { Request, Response } from "express";
import * as passport from "passport";
import { ApiError } from "../util/errorHandling";
import { HttpResponseCode } from "../util/errorHandling";

/**
 * A controller for the achievements methods
 */
export class AchievementsController {
  public async getProgressForAllAchievements(req: Request, res: Response): Promise<void> {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
  public async getProgressForAchievement(req: Request, res: Response): Promise<void> {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
  public async incrementProgressForAchievement(req: Request, res: Response): Promise<void> {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
}