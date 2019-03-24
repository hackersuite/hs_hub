import { Achievement } from "./abstract-classes";

export interface AchievementsProvider {
  getAchievements(): Achievement[];
  getAchievementWithId(id: string): Achievement;
}