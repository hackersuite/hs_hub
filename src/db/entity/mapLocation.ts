import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Cacheable } from '../../util/cache';

@Entity()
export class MapLocation implements Cacheable {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column()
	public createdAt: string;

	@Column('point')
	// Typeorm handles in the "well-known text" format
	// POINT (10 30)
	public latLng: string;

	@Column('varchar')
	public placeName: string;

	// Expires in 5 minutes
	public expiresIn = 60000;

	/**
   * Creates new Location object
   */
	public constructor(lat: number, lng: number, placeName: string) {
		this.createdAt = String(Date.now());
		this.latLng = `POINT(${lat} ${lng})`;
		this.placeName = placeName;
	}
}
