import { Achievement } from "./";

/**
 * An interface for an Achievement store
 */
export interface AchievementsProvider {

  /**
   * Returns all achievements
   */
  getAchievements(): Promise<Achievement[]>;s

  /**
   * Returns an achievement with the given id
   * @param id The id of the achievement to search for
   */
  getAchievementWithId(id: number): Promise<Achievement>;
}