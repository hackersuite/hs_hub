import { Repository } from "typeorm";
import { AchievementProgress, User } from "../../db/entity";
import { AchievementsService } from ".";
import { Achievement } from "../../util/achievements";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { AchievementProgressRepository } from "../../repositories";

export interface AchievementsProgressServiceInterface {
  getAchievementProgressForUser: (achievement: Achievement, user: User) => Promise<AchievementProgress>;
  getAchievementsProgressForUser: (user: User) => Promise<AchievementProgress[]>;
  getAchievementsProgressThatCanClaimPrize: () => Promise<AchievementProgress[]>;
  setAchievementProgressForUser: (progress: number, achievement: Achievement, user: User) => Promise<AchievementProgress>;
  setAchievementCompleteForUser: (achievement: Achievement, user: User) => Promise<AchievementProgress>;
  giveAchievementPrizeToUser: (achievement: Achievement, user: User) => Promise<AchievementProgress>;
  completeAchievementStepForUser: (step: number, token: string, achievement: Achievement, user: User) => Promise<AchievementProgress>;
}

@injectable()
export class AchievementsProgressService {
  private _achievementsProgressRepository: Repository<AchievementProgress>;
  private _achievementsService: AchievementsService;

  constructor(
    @inject(TYPES.AchievementsProgressRepository) achievementsProgressRepository: AchievementProgressRepository,
    @inject(TYPES.AchievementsService) achievementsService: AchievementsService
  ) {
    this._achievementsProgressRepository = achievementsProgressRepository.getRepository();
    this._achievementsService = achievementsService;
  }

  /**
   * Returns the given user's progress for given achievement
   * @param achievement The achievement
   * @param user The user
   */
  public getAchievementProgressForUser = async (achievement: Achievement, user: User): Promise<AchievementProgress> => {
    let achievementProgress: AchievementProgress = await this._achievementsProgressRepository
      .findOne({
        where: {
          achievementId: achievement.getId(),
          user: user
        }
      });

    if (!achievementProgress) {
      // Returning an empty AchievementProgress object if it wasn't found in the DB
      achievementProgress = new AchievementProgress(achievement, user);
    }

    // Need to set achievement manually as Achievement doesn't
    // have an actual relation with AchievementProgress in the database
    achievementProgress.setAchievement(achievement);

    return achievementProgress;
  }

  /**
   * Returns the given user's progress for each achievement
   * @param user The user
   */
  public getAchievementsProgressForUser = async (user: User): Promise<AchievementProgress[]> => {
    const achievementsProgress: AchievementProgress[] = await this._achievementsProgressRepository
      .find({
        where: {
          user
        }
      });

    const achievements: Achievement[] = await this._achievementsService.getAchievements();

    // Mapping Achievement objects to the AchievementProgress objects
    achievements.forEach((achievement: Achievement) => {
      const progressForCurrentAchievement: AchievementProgress = achievementsProgress
        .find((progress: AchievementProgress) => progress.getAchievementId() == achievement.getId());
      if (progressForCurrentAchievement) {
        progressForCurrentAchievement.setAchievement(achievement);
      } else {
        // Adding empty AchievementProgress to array if it wasn't found in the DB
        achievementsProgress.push(new AchievementProgress(achievement, user));
      }
    });

    return achievementsProgress;
  }

  /***
   * Returns all AchievementProgress objects for all users
   * where the user has completed the achievement
   * but has not yet claimed the prize
   */
  public getAchievementsProgressThatCanClaimPrize = async (): Promise<AchievementProgress[]> => {
    let achievementsProgress: AchievementProgress[] = await this._achievementsProgressRepository
      .find({
        where: {
          prizeClaimed: false
        }
      });

    const achievements: Achievement[] = await this._achievementsService.getAchievements();

    // Storing the achievements in a hash table (key - id of the achievement)
    // as using an array in this method would be very inefficient
    const achievementsMap: Map<number, Achievement> = new Map<number, Achievement>();
    achievements.forEach((achievement: Achievement) => achievementsMap.set(achievement.getId(), achievement));

    achievementsProgress = achievementsProgress.filter((achievementProgress: AchievementProgress) => {
      achievementProgress.setAchievement(achievementsMap.get(achievementProgress.getAchievementId()));
      return achievementProgress.achievementIsCompleted();
    });

    return achievementsProgress;
  }

  /**
   * Sets the user's progress for given achievement to the given value
   * Throws error if the given progress is invalid
   * @param progress The progress to set
   * @param achievement The achievement
   * @param user The user
   */
  public setAchievementProgressForUser = async (progress: number, achievement: Achievement, user: User): Promise<AchievementProgress> => {
    if (!achievement.progressIsValid(progress)) {
      throw new Error("Invalid progress provided!");
    }

    const achievementProgress: AchievementProgress = await this.getAchievementProgressForUser(achievement, user);
    achievementProgress.setProgress(progress);

    await this._achievementsProgressRepository.save(achievementProgress);

    return achievementProgress;
  }

  /**
   * Sets the user's progress for given achievement as complete
   * @param achievement The achievement
   * @param user The user
   */
  public setAchievementCompleteForUser = async (achievement: Achievement, user: User): Promise<AchievementProgress> => {
    const achievementProgress: AchievementProgress = new AchievementProgress(achievement, user, achievement.getMaxProgress());

    achievementProgress.setProgress(achievement.getMaxProgress());

    await this._achievementsProgressRepository.save(achievementProgress);

    return achievementProgress;
  }

  /**
   * Sets the user's prizeClaimed for the given achievement to true
   * @param achievement The achievement
   * @param user The user
   */
  public giveAchievementPrizeToUser = async (achievement: Achievement, user: User): Promise<AchievementProgress> => {
    const achievementProgress: AchievementProgress = await this.getAchievementProgressForUser(achievement, user);

    if (achievementProgress.getProgress() < achievement.getMaxProgress()) {
      throw new Error("The user hasn't completed this achievement yet!");
    }

    achievementProgress.setPrizeClaimed(true);

    await this._achievementsProgressRepository.save(achievementProgress);

    return achievementProgress;
  }

  /**
   * Sets a step of an achievement as comlpete for the given user
   * Throws error if the given step or token is invalid
   * @param step The step
   * @param achievement The achievement
   * @param user The user
   */
  public completeAchievementStepForUser = async (step: number, token: string, achievement: Achievement, user: User): Promise<AchievementProgress> => {
    if (achievement.getIsManual()) {
      throw new Error("This achievement can only be manually awarded by an organiser!");
    } else if (!achievement.tokenIsValidForStep(token, step)) {
      throw new Error("Invalid token provided!");
    } else if (!achievement.stepIsPossible(step)) {
      throw new Error("The given step is impossible for this achievement!");
    }

    const achievementProgress: AchievementProgress = await this.getAchievementProgressForUser(achievement, user);

    if (achievementProgress.stepIsCompleted(step)) {
      throw new Error("The given step is already completed!");
    } else if (achievement.getMustCompleteStepsInOrder() && !achievementProgress.stepIsTheNextConsecutiveStep(step)) {
      throw new Error("The steps of this achievement must be completed in order!");
    }

    achievementProgress.addCompletedStep(step);

    await this._achievementsProgressRepository.save(achievementProgress);

    return achievementProgress;
  }
}