import { Connection } from "typeorm";
import { Achievement, AchievementsProvider } from "../util/achievements";

export class AchievementsService {
  private dbConnection: Connection;
  private achievementsProvider: AchievementsProvider;

  constructor(dbConnection: Connection, achievementsProvider: AchievementsProvider) {
    this.dbConnection = dbConnection;
    this.achievementsProvider = achievementsProvider;
  }

  /**
   * Returns all achievements
   */
  public async getAchievements(): Promise<Achievement[]> {
    throw new Error("Not implemented");
  }

  /**
   * Returns all achievements with the given user's progress for each achievement
   */
  public async getAchievementsWithUserProgress(userId: number): Promise<Achievement[]> {
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