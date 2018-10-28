import { Achievement } from "../abstract-classes";
import { ApiError } from "../../errorHandling/apiError";
import { HttpResponseCode } from "../../errorHandling/httpResponseCode";
import { User } from "../../../db/entity";

/**
 * The "Beekeeper" achievement
 */
export class BeekeeperAchievement extends Achievement {
  public id: string;
  public title: string;
  public description: string;
  public prizes: string;
  public finishMessage: string;
  public maxProgress: string;
  public incrementProgress(user: User, token: string): number {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
  public checkProgress(user: User): number {
    throw new ApiError(HttpResponseCode.NOT_IMPLEMENTED);
  }
}