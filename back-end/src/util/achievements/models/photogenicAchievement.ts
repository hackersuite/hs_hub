import { Achievement } from "../abstract-classes";

/**
 * The "Photogenic Bee" achievement
 * Can be completed by being the person that appears the most at the photo booth
 */
export class PhotogenicAchievement extends Achievement {
  public id: string = "photogenic";
  public title: string = "Photogenic Bee";
  public description: string = "The person that appeared the most at the photo booth";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 1;
  protected isManual: boolean = true;
}