import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
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
   * Also, users are able to reserve many different hardware items
   */
	@OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.user)
	public hardwareItems!: ReservedHardwareItem[];

	@Column('boolean', { 'default': false })
	public completed_intro!: boolean;

	public getId() {
		return this.id;
	}

	public getName() {
		return this.name;
	}
}
