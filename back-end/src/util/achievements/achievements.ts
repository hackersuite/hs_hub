import { Achievement } from "./abstract-classes";
import { BeekeeperAchievement } from "./models";
import { Cache } from "../cache";
import { User } from "../../db/entity/hub";
import { ApiError, HttpResponseCode } from "../errorHandling";

/**
 * The top-level interface for the achievements system
 */
export abstract class Achievements {
  /**
   * The collection of all implemented achievements
   */
  private static readonly achievementsCollection: Achievement[] = [
    new BeekeeperAchievement()
  ];

  /**
   * Returns all achievements
   */
  public static getAchievements(): Achievement[] {
    return this.achievementsCollection;
  }

  /**
   * Returns achievement with given id
   */
  public static getAchievementWithId(id: string): Achievement {
    return this.achievementsCollection.find((achievement: Achievement) =>
      achievement.id === id
    );
  }

  /**
   * Returns the user's progress on all implemented achievements
   * @param user The user to find progress for
   */
  public static async getUserProgressForAllAchievements(user: User): Promise<Map<string, number>> {
    return await Cache.achievementsProgess.getUserProgressForAllAchievements(user);
  }

  /**
   * Returns the user's progress on a specific achievement
   * @param user The user to find progress for
   * @param achievementId The id of the achievement to find progress for
   */
  public static async getUserProgressForAchievement(user: User, achievementId: string): Promise<number> {
    const achievementProgress = await Cache.achievementsProgess.getElementForUser(user, achievementId);
    return achievementProgress ? achievementProgress.progress : 0;
  }

  /**
   * Increments the user's progress on an achievement
   * @param user The user
   * @param achievementId The id of the achievement
   * @param token The token used to verify the validity of the request
   */
  public static async incrementUserProgressForAchievement(user: User, achievementId: string, token?: string, step?: string): Promise<number> {
    for (const achievement of this.achievementsCollection) {
      if (achievement.id === achievementId) {
        // REVIEW: would be possible to handle this with a single query (UPDATE to database and the update the data in the cache directly)
        // though we might have some problems in terms of data synchronization
        const currentProgress: number = await achievement.incrementProgress(user, token, step);
        await (await Cache.achievementsProgess.getElementForUser(user, achievementId)).sync();
        return currentProgress;
      }
    }
    return 0;
  }

  /**
   * Forces a resync for the user's progress on the achievement and returns the latest progress
   * @param user The user
   * @param achievementId The achievement id
   */
  public static async refreshUserProgressForAchievement(user: User, achievementId: string): Promise<number> {
    (await Cache.achievementsProgess.getElementForUser(user, achievementId)).sync();
    return (await Cache.achievementsProgess.getElementForUser(user, achievementId)).progress;
  }
}