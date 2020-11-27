import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class UserContactDetails {
	@PrimaryColumn('uuid')
	public userId!: string;

	@Column('varchar', { nullable: false })
	public phone!: string;

	@Column('varchar', { nullable: false })
	public addr1!: string;

	@Column('varchar', { nullable: true })
	public addr2?: string;

	@Column('varchar', { nullable: true })
	public addr3?: string;

	@Column('varchar', { nullable: false })
	public country!: string;

	@Column('varchar', { nullable: true })
	public spr?: string;

	@Column('varchar', { nullable: false })
	public city!: string;

	@Column('varchar', { nullable: false })
	public zip!: string;

	@Column('varchar', { nullable: true })
	public tshirt!: string;

	@Column('boolean', { 'default': false })
	public foodFromDeliveroo!: boolean;
}
