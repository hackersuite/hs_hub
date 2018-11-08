import { Achievement } from "../abstract-classes";

/**
 * The "Social Butterfly" achievement
 * Can be completed by sending the most messages on Slack
 */
export class SocialAchievement extends Achievement {
  public id: string = "social";
  public title: string = "Social Butterfly";
  public description: string = "Sent the most messages on Slack";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 1;
  protected isManual: boolean = true;
}