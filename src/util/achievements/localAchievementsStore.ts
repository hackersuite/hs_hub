import { AchievementsProvider } from "./achievementsProvider";
import { Achievement } from "./";
import { AchievementOptions } from "./achievementOptions";

export class LocalAchievementsStore implements AchievementsProvider {
  /**
   * The settings of the Achievements to load to the store
   */
  private achievementsToLoad: AchievementOptions[] = [
    {
      title: "Sample",
      description: "some cool description",
      prizeURL: "http://placekitten.com/200/300",
      maxProgress: 1
    },
    {
      title: "Sample manual",
      description: "some cool description",
      prizeURL: "http://placekitten.com/200/300",
      maxProgress: 1,
      isManual: true
    },
    {
      title: "Sample with token",
      description: "some cool description",
      prizeURL: "http://placekitten.com/200/300",
      maxProgress: 1,
      requiresToken: true
    },
    {
      title: "Sample multi-step",
      description: "some cool description",
      prizeURL: "http://placekitten.com/200/300",
      maxProgress: 2
    },
    {
      title: "Sample multi-step with ordered step",
      description: "some cool description",
      prizeURL: "http://placekitten.com/200/300",
      maxProgress: 2,
      mustCompleteStepsInOrder: true
    },
  ];

  private achievements: Achievement[];

  /**
   * Creates a local Achievement store that stores hard-coded achievements in memory
   */
  constructor() {
    this.loadAchievements(this.achievementsToLoad);
  }

  /**
   * Loads up all achievements in achievementsToLoad
   */
  private loadAchievements(achievementsToLoad: AchievementOptions[]) {
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
  public async getAchievements(): Promise<Achievement[]> {
    return this.achievements;
  }

  /**
   * Returns an achievement with the given id. Returns undefined if not found
   * @param id The id of the achievement to search for
   */
  public async getAchievementWithId(id: number): Promise<Achievement> {
    return this.achievements.find((achievement: Achievement) => achievement.getId() === id);
  }
}