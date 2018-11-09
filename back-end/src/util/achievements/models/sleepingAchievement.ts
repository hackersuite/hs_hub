import { Achievement } from "../abstract-classes";

/**
 * The "Sleeping Beauty" achievement
 * Can be completed by being the person that slept the most
 */
export class SleepingAchievement extends Achievement {
  public id: string = "sleeping";
  public title: string = "Sleeping Beauty";
  public description: string = "The person that slept the most";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 1;
  protected isManual: boolean = true;
}