import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Cacheable } from '../../util/cache';
import { IsDefined, MaxLength, IsDate } from 'class-validator';

@Entity()
export class Event implements Cacheable {
	@PrimaryGeneratedColumn()
	public id!: number;

	@IsDefined({ message: 'The title must be defined' })
	@MaxLength(127)
	@Column('varchar', { length: 127 })
	public title!: string;

	@IsDefined({ message: 'The start time must be defined' })
	@IsDate()
	@Column()
	public startTime!: Date;

	@Column()
	@IsDate()
	public endTime!: Date;

	@Column('varchar', { length: 127 })
	public location!: string;

	// The lifetime of this object in the cache is 10 seconds
	public expiresIn = 10000;

	public constructor(title: string, startTime: Date, endTime: Date, location: string) {
		this.title = title;
		this.startTime = startTime;
		this.endTime = endTime;
		this.location = location;
	}
}
