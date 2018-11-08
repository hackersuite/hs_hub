import { Achievement } from "../abstract-classes";

/**
 * The "I can handle the business side" achievement
 * Can be completed by having the most buzz words in the hack presentation
 */
export class BusinessAchievement extends Achievement {
  public id: string = "business";
  public title: string = "I can handle the business side";
  public description: string = "Project with the most buzz words";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 1;
  protected isManual: boolean = true;
}