import { Repository } from "typeorm";
import { AchievementProgress, User } from "../db/entity/hub";
import { AchievementsService } from "./";
import { Achievement } from "../util/achievements";

export class AchievementsProgressService {
  private achievementsProgressRepository: Repository<AchievementProgress>;
  private achievementsService: AchievementsService;

  constructor(achievementsProgressRepository: Repository<AchievementProgress>, achievementsService: AchievementsService) {
    this.achievementsProgressRepository = achievementsProgressRepository;
    this.achievementsService = achievementsService;
  }

  /**
   * Returns the given user's progress for given achievement
   * @param achievement The achievement
   * @param user The user
   */
  public async getAchievementProgressForUser(achievement: Achievement, user: User): Promise<AchievementProgress> {
    const achievementProgress: AchievementProgress = await this.achievementsProgressRepository
      .createQueryBuilder("achievementProgress")
      .where("achievementProgress.achievementId = :id", { id: achievement.getId() })
      .where("achievementProgress.userId = :id", { id: user.getId() })
      .getOne();

    // Need to set achievement manually as Achievement doesn't
    // have an actual relation with AchievementProgress in the database
    achievementProgress.setAchievement(achievement);

    return achievementProgress;
  }


  /**
   * Returns the given user's progress for each achievement
   * @param user The user
   */
  public async getAchievementsProgressForUser(user: User): Promise<AchievementProgress[]> {
    const achievementsProgress: AchievementProgress[] = await this.achievementsProgressRepository
      .createQueryBuilder("achievementProgress")
      .where("achievementProgress.userId = :userId", { userId: user.getId() })
      .getMany();

    const achievements: Achievement[] = await this.achievementsService.getAchievements();

    achievementsProgress.forEach((achievementProgress: AchievementProgress) => {
      const currentAchievement: Achievement = achievements
        .find((achievement: Achievement) =>
          achievement.getId() == achievementProgress.getAchievementId());

      achievementProgress.setAchievement(currentAchievement);
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
  public async setAchievementProgressForUser(progress: number, achievement: Achievement, user: User): Promise<void> {
    if (!achievement.progressIsValid(progress)) {
      throw new Error("Invalid progress provided!");
    }

    await this.achievementsProgressRepository
      .createQueryBuilder("achievementProgress")
      .update()
      .set({ progress })
      .where("achievementProgress.achievementId = :id", { id: achievement.getId() })
      .andWhere("achievementProgress.userId = :id", { id: user.getId() })
      .execute();
  }

  /**
   * Sets the user's progress for given achievement as complete
   * @param achievement The achievement
   * @param user The user
   */
  public async setAchievementCompleteForUser(achievement: Achievement, user: User): Promise<void> {
    await this.achievementsProgressRepository
      .createQueryBuilder("achievementProgress")
      .update()
      .set({ progress: achievement.getMaxProgress() })
      .where("achievementProgress.achievementId = :id", { id: achievement.getId() })
      .andWhere("achievementProgress.userId = :id", { id: user.getId() })
      .execute();
  }

  /**
   * Sets the user's prizeClaimed for the given achievement to true
   * @param achievement The achievement
   * @param user The user
   */
  public async giveAchievementPrizeToUser(achievement: Achievement, user: User): Promise<void> {
    const test = await this.achievementsProgressRepository
      .createQueryBuilder("achievementProgress")
      .update()
      .set({ prizeClaimed: true })
      .where("achievementProgress.achievementId = :id", { id: achievement.getId() })
      .andWhere("achievementProgress.userId = :id", { id: user.getId() })
      .execute();
  }

  /**
   * Sets a step of an achievement as comlpete for the given user
   * Throws error if the given step is invalid
   * @param step The step
   * @param achievement The achievement
   * @param user The user
   */
  public async completeAchievementStepForUser(step: number, achievement: Achievement, user: User): Promise<AchievementProgress> {
    const achievementProgress: AchievementProgress = await this.getAchievementProgressForUser(achievement, user);

    if (achievementProgress.stepIsCompleted(step)) {
      throw new Error("The given step is already comlpeted!");
    } else if (achievement.getMustCompleteStepsInOrder() && !achievementProgress.stepIsTheNextConsecutiveStep(step)) {
      throw new Error("The steps of this achievement must be completed in order!");
    }

    achievementProgress.addCompletedStep(step);

    await this.achievementsProgressRepository
      .createQueryBuilder("achievementProgress")
      .update()
      .set({ completedSteps: achievementProgress.getCompletedSteps() })
      .where("achievementProgress.achievementId = :id", { id: achievement.getId() })
      .andWhere("achievementProgress.userId = :id", { id: user.getId() })
      .execute();

    return achievementProgress;
  }
}