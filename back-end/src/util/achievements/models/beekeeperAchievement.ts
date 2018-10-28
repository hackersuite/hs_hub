import { Achievement } from "../abstract-classes";
import { ApiError } from "../../errorHandling";
import { HttpResponseCode } from "../../errorHandling";
import { User } from "../../../db/entity/hub";

/**
 * The "Beekeeper" achievement
 * Can be completed by finding all bees in the treasure hunt
 */
export class BeekeeperAchievement extends Achievement {
  public id: string;
  public title: string;
  public description: string;
  public prizes: string;
  public finishMessage: string;
  public maxProgress: string;
  public incrementProgress(userId: number, token: string): number {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
  public checkProgress(userId: number): number {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
}