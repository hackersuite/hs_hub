import { Achievement } from "./abstract-classes";
import { User } from "../../db/entity/hub";
import { ApiError } from "../errorHandling";
import { HttpResponseCode } from "../errorHandling";
import { BeekeeperAchievement } from "./models";

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
  public static getUserProgressForAllAchievements(user: User): Map<string, number> {
    // get the progress from cache
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }

  /**
   * Returns the user's progress on a specific achievement
   * @param user The user to find progress for
   * @param achievementId The id of the achievement to find progress for
   */
  public static getUserProgressForAchievement(user: User, achievementId: string): number {
    // find in achievementsCollection
    // get the progress from cache
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }

  /**
   * Increments the user's progress on an achievement
   * @param user The user
   * @param achievementId The id of the achievement
   * @param token The token used to verify the validity of the request
   */
  public static incrementUserProgressForAchievement(user: User, achievementId: string, token: string): number {
    // find in achievementsCollection
    // call incrementProgress
    // update data in cache
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }

  public static refreshUserProgressForAchievement(user: User, achievementId: string) {
    // find in cache
    // call sync()
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
}