import { Achievement } from "../abstract-classes";

/**
 * The "Everyone likes a participation prize" achievement
 * Can be completed by demoing a hack
 */
export class ParticipationAchievement extends Achievement {
  public id: string = "participation";
  public title: string = "Everyone likes a participation prize";
  public description: string = "Demoed a hack";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 1;
  protected isManual: boolean = true;
}