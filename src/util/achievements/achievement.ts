import { AchievementOptions } from "./";

/**
 * Class for an achievement
 */
export class Achievement {
  private id: number;
  private title: string;
  private description: string;

  /**
   * The URL to the image of the prize for the achievement
   */
  private prizeURL: string;

  /**
   * The maximum progress of this achievement
   */
  private maxProgress: number;

  /**
   * Specifies whether or not a token is required when incrementing the user's progress on this achievement.
   */
  private requiresToken: boolean;

  /**
   * Specifies whether or not this achievement can only be rewarded by organizers
   */
  private isManual: boolean;

  /**
   * Specifies whether or not the steps of the achievement must be completed in order
   */
  private mustCompleteStepsInOrder: boolean;

  /**
   * 
   * @param options The options of the achievement
   */
  constructor(id: number, options: AchievementOptions) {
    const { title, description, prizeURL, maxProgress,
      requiresToken, isManual, mustCompleteStepsInOrder } = options;

    this.id = id;
    this.title = title;
    this.description = description;
    this.prizeURL = prizeURL;
    this.maxProgress = maxProgress;
    this.requiresToken = requiresToken;
    this.isManual = isManual;
    this.mustCompleteStepsInOrder = mustCompleteStepsInOrder;
  }

  /**
   * Returns the id of the achievement
   */
  public getId() {
    return this.id;
  }

  /**
   * Returns the title of the achievement
   */
  public getTitle() {
    return this.title;
  }

  /**
   * Returns the description of the achievement
   */
  public getDescription() {
    return this.description;
  }

  /**
   * Returns the url to the image of the prize of the achievement
   */
  public getPrizeURL() {
    return this.prizeURL;
  }

  /**
   * Returns the maximum progress of the achievement
   */
  public getMaxProgress() {
    return this.maxProgress;
  }

  /**
   * Returns whether or not a token is required
   * when incrementing the user's progress on the achievement
   */
  public getRequiresToken() {
    return this.requiresToken;
  }

  /**
   * Returns whether or not this achievement can only be completed by organizers
   */
  public getIsManual() {
    return this.isManual;
  }

  /**
   * Returns whether or not the steps of this achievement must be completed in order
   */
  public getMustCompleteStepsInOrder() {
    return this.mustCompleteStepsInOrder;
  }
}