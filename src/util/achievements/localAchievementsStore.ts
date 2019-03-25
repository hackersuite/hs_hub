import { AchievementsProvider } from "./achievementsProvider";
import { Achievement } from "./";
import { AchievementOptions } from "./achievementOptions";

export class LocalAchievementsStore implements AchievementsProvider {
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

  constructor() {
    let id = 0;
    this.achievementsToLoad.forEach((options: AchievementOptions) => {
      this.achievements.push(new Achievement(id, options));
      id++;
    });
  }

  public async getAchievements(): Promise<Achievement[]> {
    throw new Error("Method not implemented.");
  }

  public async getAchievementWithId(id: number): Promise<Achievement> {
    throw new Error("Method not implemented.");
  }
}