import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { AchievementProgress } from './achievementProgress';
import { ReservedHardwareItem } from './reservedHardwareItem';

/**
 * A class to store the user entity in the database
 */
@Entity()
export class User {
	@Column('varchar')
	public name!: string;

	@PrimaryColumn('varchar')
	public id!: string;

	@Column('simple-array', { nullable: true })
	public push_id?: string[];

	/**
   * Every user is able to have many different achievements so create a typeorm relationship
   */
	@OneToMany(() => AchievementProgress, aProgress => aProgress.user)
	public achievementsProgress!: AchievementProgress;

	/**
   * Also, users are able to reserve many different hardware items
   */
	@OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
	public hardwareItems!: ReservedHardwareItem[];

	public getId() {
		return this.id;
	}

	public getName() {
		return this.name;
	}
}
