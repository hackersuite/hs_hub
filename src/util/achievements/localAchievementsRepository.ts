import { Achievement, AchievementsRepository, AchievementOptions } from '.';
import { injectable } from 'inversify';

@injectable()
export class LocalAchievementsRepository implements AchievementsRepository {
	/**
   * The loaded achievements
   */
	private readonly achievements: Achievement[];

	/**
   * Creates a local Achievement store that stores hard-coded achievements in memory
   */
	public constructor(achievementsToLoad: AchievementOptions[]) {
		this.achievements = [];

		let id = 0;
		achievementsToLoad.forEach((options: AchievementOptions) => {
			this.achievements.push(new Achievement(id, options));
			id++;
		});
	}

	/**
   * Returns all achievements
   */
	public getAll(): Promise<Achievement[]> {
		return Promise.resolve(this.achievements);
	}

	/**
   * Returns an achievement with the given id.
   * @param id The id of the achievement to search for
   */
	public findOne(id: number): Promise<Achievement> {
		const achievement = this.achievements.find((achievement: Achievement) => achievement.getId() === id);
		if (!achievement) throw new Error('Could not find an achievement with given id!');
		return Promise.resolve(achievement);
	}
}
