import { Achievement } from '.';

/**
 * An interface for an Achievement store
 */
export interface AchievementsRepository {

	/**
   * Returns all achievements
   */
	getAll(): Promise<Achievement[]>;

	/**
   * Returns an achievement with the given id
   * @param id The id of the achievement to search for
   */
	findOne(id: number): Promise<Achievement>;
}
