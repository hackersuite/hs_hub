import { Connection } from "typeorm";
import { Achievement } from "../util/achievements";
import { AchievementProgress } from "../db/entity/hub";
import { AchievementsService } from "./";

export class AchievementsProgressService {
  private dbConnection: Connection;
  private achievementsService: AchievementsService;

  constructor(dbConnection: Connection, achievementsService: AchievementsService) {
    this.dbConnection = dbConnection;
    this.achievementsService = achievementsService;
  }
  
  /**
   * Returns all achievements with the given user's progress for each achievement
   */
  public async getAchievementsProgressForUser(userId: number): Promise<AchievementProgress[]> {
    throw new Error("Not implemented");
  }

  /**
   * Sets the user's progress for given achievement to the given value
   * Throws error if the given progress is invalid
   */
  public async setAchievementProgressForUser(progress: number, achievementId: string, userId: number): Promise<void> {
    throw new Error("Not implemented");
  }

  /**
   * Sets the user's progress for given achievement as complete
   */
  public async setAchievementCompleteForUser(achievementId: string, userId: number): Promise<void> {
    throw new Error("Not implemented");
  }

  /**
   * Sets the user's prizeClaimed for the given achievement to true
   */
  public async giveAchievementPrizeToUser(achievementId: string, userId: number): Promise<void> {
    throw new Error("Not implemented");
  }
}