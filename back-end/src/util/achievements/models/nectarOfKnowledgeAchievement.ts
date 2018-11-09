import { Achievement } from "../abstract-classes";

/**
 * The "Nectar of Knowledge" achievement
 * Can be completed by going to all workshops
 */
export class NectarOfKnowledgeAchievement extends Achievement {
  public id: string = "nectarOfKnowledge";
  public title: string = "Nectar of Knowledge";
  public description: string = "Went to all workshops";
  public prizes: string = "something cool";
  public finishMessage: string = "nice job";
  public maxProgress: number = 2;
  protected requiresToken: boolean = true;
  protected isMultiStep: boolean = true;
}