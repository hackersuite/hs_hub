import { Entity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./";
import { Achievement } from "../../../util/achievements";

/**
 * A class to store a user's progress on a specific achievement
 */
@Entity()
export class AchievementProgress {
  /**
   * The id of the achievement
   */
  @PrimaryColumn()
  private achievementId: number;

  /**
   * The user
   */
  @ManyToOne(type => User, user => user.achievementsProgress, {
    primary: true
  })
  private user: User;

  /**
   * The progress that has been made
   */
  @Column({
    nullable: false
  })
  private progress: number;

  /**
   * All completed steps stored in a string
   */
  @Column({
    type: "varchar",
    length: "127",
    nullable: false
  })
  private completedSteps: string;

  /**
   * Wether or not the user has claimed their prize for the achievement
   */
  @Column()
  private prizeClaimed: boolean;

  /**
   * The achievement (not stored on the database)
   */
  private achievement: Achievement;

  /**
   * 
   * @param achievement The achievement
   * @param user The user
   * @param progress (optional) The progress the user has made on this achievement
   * @param stepsCompleted (optional) The steps the user has completed
   * @param prizeClaimed (optional) Wether or not the user has claimed their prize for the achievement
   */
  constructor(achievement: Achievement, user: User, progress?: number, stepsCompleted?: string, prizeClaimed?: boolean) {
    this.achievementId = achievement.getId();
    this.user = user;
    this.progress = progress || 0;
    this.completedSteps = stepsCompleted || "";
    this.prizeClaimed = prizeClaimed;
    this.achievement = achievement;
  }

  /**
   * Returns the id of the achievement
   */
  public getAchievementId() {
    return this.achievementId;
  }

  /**
   * Returns the progress made by the user
   */
  public getProgress() {
    return this.progress;
  }

  /**
   * Returns the user
   */
  public getUser() {
    return this.user;
  }

  /**
   * Returns the steps the user has completed
   */
  public getCompletedSteps() {
    return this.completedSteps;
  }

  /**
   * Returns wether or not the user has claimed their prize for the achievement
   */
  public getPrizeClaimed() {
    return this.prizeClaimed;
  }

  /**
   * Returns the achievement
   */
  public getAchievement() {
    return this.achievement;
  }
}