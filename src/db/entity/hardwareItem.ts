import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ReservedHardwareItem } from './reservedHardwareItem';
import { IsUrl, IsString, IsNumber, IsDefined, Min } from 'class-validator';

@Entity()
export class HardwareItem {
	@PrimaryGeneratedColumn()
	public id!: number;

	@IsDefined({ message: 'The name must be defined' })
	@Column('varchar', { length: 255, nullable: false, unique: true })
	@IsString()
	public name!: string;

	@IsDefined({ message: 'The total stock must be defined' })
	@Min(1, { message: 'Why have the item on the library if the stock is less than 1?' })
	@Column()
	@IsNumber()
	public totalStock!: number;

	@Column()
	public reservedStock!: number;

	@Column()
	public takenStock!: number;

	@IsDefined({ message: 'The item URL must be defined' })
	@IsUrl()
	@Column('varchar', { length: 1024 })
	public itemURL!: string;

	@OneToMany(() => ReservedHardwareItem, reservedHardwareItem => reservedHardwareItem.hardwareItem)
	public reservations!: ReservedHardwareItem[];
}
