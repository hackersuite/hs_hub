import { Entity, Column, ManyToOne } from 'typeorm';
import { HardwareItem } from './hardwareItem';
import { User } from './user';

@Entity()
export class ReservedHardwareItem {
	@ManyToOne(() => User, { primary: true })
	public user!: User;

	@ManyToOne(() => HardwareItem, { primary: true })
	public hardwareItem!: HardwareItem;

	@Column()
	public isReserved!: boolean;

	@Column('varchar', { unique: true })
	public reservationToken!: string;

	@Column('datetime')
	public reservationExpiry!: Date;

	@Column()
	public reservationQuantity!: number;
}
