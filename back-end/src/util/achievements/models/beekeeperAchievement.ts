import { Achievement } from "../abstract-classes";

/**
 * The "Beekeeper" achievement
 * Can be completed by finding all bees in the treasure hunt
 */
export class BeekeeperAchievement extends Achievement {
  public id: string = "beekeeper";
  public title: string = "Beekeeper";
  public description: string = "Find all bees in around the building";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 8;
  protected requiresToken: boolean = true;
}