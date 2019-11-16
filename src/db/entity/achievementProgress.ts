import { Entity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./";
import { Achievement } from "../../util/achievements";

/**
 * A class to store a user's progress on a specific achievement
 */
@Entity()
export class AchievementProgress {
  /**
   * The id of the achievement
   */
  @PrimaryColumn()
  achievementId: number;

  /**
   * The user
   */
  @ManyToOne(type => User, user => user.achievementsProgress, {
    eager: true,
    primary: true
  })
  user: User;

  /**
   * The progress that has been made
   */
  @Column({
    nullable: false
  })
  progress: number;

  /**
   * All completed steps stored in a JSON array as a string
   */
  @Column({
    nullable: false,
    type: "simple-json"
  })
  completedSteps: number[];

  /**
   * Wether or not the user has claimed their prize for the achievement
   */
  @Column()
  prizeClaimed: boolean;

  /**
   * The achievement (not stored on the database)
   */
  achievement: Achievement;

  /**
   *
   * @param achievement The achievement
   * @param user The user
   * @param progress (optional) The progress the user has made on this achievement
   * @param stepsCompleted (optional) The steps the user has completed
   * @param prizeClaimed (optional) Wether or not the user has claimed their prize for the achievement
   */
  constructor(achievement: Achievement, user: User, progress?: number, stepsCompleted?: number[], prizeClaimed?: boolean) {
    this.achievementId = achievement ? achievement.getId() : undefined;
    this.user = user;
    this.progress = progress || 0;
    this.completedSteps = stepsCompleted || [];
    this.prizeClaimed = prizeClaimed || false;
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
   * Sets the progress made by the user
   */
  public setProgress(progress: number) {
    this.progress = progress;
  }

  /**
   * Returns the user
   */
  public getUser() {
    return this.user;
  }

  /**
   * Sets the user
   */
  public setUser(user: User) {
    this.user = user;
  }


  /**
   * Returns the steps the user has completed
   */
  public getCompletedSteps() {
    return this.completedSteps;
  }

  /**
   * Adds a step to the completed steps and
   * increments the progress
   */
  public addCompletedStep(step: number) {
    this.completedSteps.push(step);
    this.progress++;
  }

  /**
   * Returns wether or not the user has claimed their prize for the achievement
   */
  public getPrizeClaimed() {
    return this.prizeClaimed;
  }

  /**
   * Sets the value of prizeClaimed
   */
  public setPrizeClaimed(value: boolean) {
    this.prizeClaimed = value;
  }

  /**
   * Returns the achievement
   */
  public getAchievement() {
    return this.achievement;
  }

  /**
   * Sets the achievement
   */
  public setAchievement(achievement: Achievement) {
    this.achievement = achievement;
  }

  /**
   * Check if the given step is already completed
   * @param step The step
   */
  public stepIsCompleted(step: number): boolean {
    if (this.completedSteps.find((s: number) => s == step))
      return true;
    return false;
  }

  /**
   * Check if the given step is the next consecutive
   * step to be completed for this achievement
   * @param step The step
   */
  public stepIsTheNextConsecutiveStep(step: number): boolean {
    const lastCompletedStep: number = Number(this.completedSteps[this.completedSteps.length - 1]) || 0;
    return lastCompletedStep + 1 === step;
  }

  /**
   * Checks wether the achievement is completed
   */
  public achievementIsCompleted(): boolean {
    return this.progress >= this.achievement.getMaxProgress();
  }
}