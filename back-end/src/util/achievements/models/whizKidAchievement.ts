import { Achievement } from "../abstract-classes";

/**
 * The "Whiz Kid" achievement
 * Can be completed by hacking solo
 */
export class WhizKidAchievement extends Achievement {
  public id: string = "whizKid";
  public title: string = "Whiz Kid";
  public description: string = "Hacked solo";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 1;
  protected isManual: boolean = true;
}