import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Cacheable } from '../../util/cache';
import { IsDefined, MaxLength } from 'class-validator';

@Entity()
export class Challenge implements Cacheable {
	@PrimaryGeneratedColumn()
	public id!: number;

	@IsDefined({ message: 'The title must be defined' })
	@MaxLength(128)
	@Column('varchar', { length: 128 })
	public title!: string;

	@IsDefined({ message: 'The description must be defined' })
	@MaxLength(500)
	@Column('varchar', { length: 500 })
	public description!: string;

	@IsDefined({ message: 'The company must be defined' })
	@MaxLength(128)
	@Column('varchar', { length: 128 })
	public company!: string;

	@MaxLength(255)
	@Column('varchar', { length: 255 })
	public prizes!: string;

	// Expires in one minute
	public expiresIn = 60000;

	public constructor(title: string, description: string, company: string, prizes: string) {
		this.title = title;
		this.description = description;
		this.company = company;
		this.prizes = prizes;
	}
}
