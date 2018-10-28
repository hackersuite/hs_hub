import { User } from "../../../db/entity";

/**
 * Abstract class for all achievements
 */
export abstract class Achievement {
  /**
   * The id of the achievement
   */
  public abstract id: string;
  /**
   * The title of the achievement
   */
  public abstract title: string;
  /**
   * The description of the achievement
   */
  public abstract description: string;
  /**
   * The prizes of the achievement
   */
  public abstract prizes: string;
  /**
   * The message to be sent to the user when the achievement is finished
   */
  public abstract finishMessage: string;
  /**
   * The maximum progress of this achievement
   */
  public abstract maxProgress: string;

  /**
   * A method to increment the user's progress on the achievement
   * after checking that the token is valid.
   * @param user The user that completed a part of the achievement
   * @param token The token is a string that helps us check which part of the
   * achievement the user completed. It should be a random string
   * to allow us to use it for verification that the user has actually completed the task
   */
  public abstract incrementProgress(user: User, token: string): number;


  /**
   * A method to check a user's progress in this achievement
   * @param user The user to check the achievemt progress for
   */
  public abstract checkProgress(user: User): number;
}