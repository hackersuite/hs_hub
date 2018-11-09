import { Achievement } from "../abstract-classes";

/**
 * The "Buzzing" achievement
 * Can be completed by attending at least 2 well-being activities
 */
export class BuzzingAchievement extends Achievement {
  public id: string = "buzzing";
  public title: string = "Buzzing";
  public description: string = "Attended at least 2 well-being activities";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 3;
  protected requiresToken: boolean = true;
  protected isMultiStep: boolean = true;
}