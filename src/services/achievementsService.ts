import { Achievement, AchievementsRepository } from "../util/achievements";

export class AchievementsService {
  private achievementsRepository: AchievementsRepository;

  constructor(achievementsRepository: AchievementsRepository) {
    this.achievementsRepository = achievementsRepository;
  }

  /**
   * Returns all achievements
   */
  public async getAchievements(): Promise<Achievement[]> {
    return this.achievementsRepository.getAchievements();
  }

  /**
   * Returns an achievement with the given id.
   * Throws error if no achievement with given id can be found
   * @param id The id of the achievement to search for
   */
  public async getAchievementWithId(id: number): Promise<Achievement> {
    const achievement: Achievement = await this.achievementsRepository.getAchievementWithId(id);
    if (!achievement) {
      throw new Error("Could not find an achievement with given id!");
    }
    return achievement;
  }
}