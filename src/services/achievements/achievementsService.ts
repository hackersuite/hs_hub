import { Achievement, LocalAchievementsRepository, AchievementsRepository } from "../../util/achievements";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { Repository } from "typeorm";

export interface AchievementsServiceInterface {
  getAchievements: () => Promise<Achievement[]>;
  getAchievementWithId: (id: number) => Promise<Achievement>;
}

@injectable()
export class AchievementsService implements AchievementsServiceInterface {
  private _achievementsRepository: LocalAchievementsRepository;

  constructor(@inject(TYPES.LocalAchievementsRepository) achievementsRepository: LocalAchievementsRepository) {
    this._achievementsRepository = achievementsRepository;
  }

  /**
   * Returns all achievements
   */
  public getAchievements = async (): Promise<Achievement[]> => {
    return await this._achievementsRepository.getAll();
  }

  /**
   * Returns an achievement with the given id.
   * Throws error if no achievement with given id can be found
   * @param id The id of the achievement to search for
   */
  public getAchievementWithId = async (id: number): Promise<Achievement> => {
    const achievement: Achievement = await this._achievementsRepository.findOne(id);
    if (!achievement) {
      throw new Error("Could not find an achievement with given id!");
    }
    return achievement;
  }
}