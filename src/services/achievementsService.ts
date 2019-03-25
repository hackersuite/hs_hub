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
   * Returns an achievement with the given id. Returns undefined if not found
   * @param id The id of the achievement to search for
   */
  public async getAchievementWithId(id: number): Promise<Achievement> {
    return this.achievementsRepository.getAchievementWithId(id);
  }
}