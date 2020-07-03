import { Entity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { User } from './';
import { Achievement } from '../../util/achievements';

/**
 * A class to store a user's progress on a specific achievement
 */
@Entity()
export class AchievementProgress {
	/**
   * The id of the achievement
   */
	@PrimaryColumn()
	public achievementId!: number;

	/**
   * The user
   */
	@ManyToOne(() => User, user => user.achievementsProgress, {
		eager: true,
		primary: true
	})
	public user!: User;

	/**
   * The progress that has been made
   */
	@Column({
		nullable: false
	})
	public progress!: number;

	/**
   * All completed steps stored in a JSON array as a string
   */
	@Column({
		nullable: false,
		type: 'simple-json'
	})
	public completedSteps!: number[];

	/**
   * Wether or not the user has claimed their prize for the achievement
   */
	@Column()
	public prizeClaimed!: boolean;

	/**
   * The achievement (not stored on the database)
   */
	public achievement!: Achievement;

	/**
   *
   * @param achievement The achievement
   * @param user The user
   * @param progress (optional) The progress the user has made on this achievement
   * @param stepsCompleted (optional) The steps the user has completed
   * @param prizeClaimed (optional) Wether or not the user has claimed their prize for the achievement
   */
	public constructor(achievement: Achievement, user: User, progress = 0, stepsCompleted: number[] = [], prizeClaimed = false) {
		// This is sometimes called with no arguments? Might be how TypeORM works when loading the entity?
		if (arguments.length === 0) return;
		this.achievementId = achievement.getId();
		this.user = user;
		this.progress = progress;
		this.completedSteps = stepsCompleted;
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
		if (this.completedSteps.find((s: number) => s === step)) { return true; }
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
