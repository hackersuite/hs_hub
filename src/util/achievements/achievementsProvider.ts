import { Achievement } from "./";

export interface AchievementsProvider {
  getAchievements(): Promise<Achievement[]>;
  getAchievementWithId(id: number): Promise<Achievement>;
}