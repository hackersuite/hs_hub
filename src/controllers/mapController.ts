import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { Cache } from '../util/cache';
import { MapLocation } from '../db/entity';
import { HttpResponseCode } from '../util/errorHandling';
import { MapService } from '../services/map';
import autoBind from 'auto-bind';

export interface MapControllerInterface {
	getAllLocations: (req: Request, res: Response) => Promise<void>;
}

/**
 * A controller for the map methods
 */
@injectable()
export class MapController implements MapControllerInterface {
	private readonly cache: Cache;
	private readonly mapService: MapService;

	public constructor(@inject(TYPES.Cache) _cache: Cache, @inject(TYPES.MapService) _mapService: MapService) {
		this.cache = _cache;
		this.mapService = _mapService;
		autoBind(this);
	}

	public async getAllLocations(req: Request, res: Response) {
		try {
			let locations: MapLocation[] = this.cache.getAll(MapLocation.name);

			if (locations.length === 0) {
				locations = await this.mapService.getAll();
				this.cache.setAll(MapLocation.name, locations);
			}

			res.send(locations);
		} catch (err) {
			res.status(HttpResponseCode.INTERNAL_ERROR).send('Failed to find locations');
		}
	}

	public async addLocation(req: Request, res: Response) {
		try {
			await this.mapService.add(req.body.city, req.body.country);
			this.cache.deleteAll(MapLocation.name);
			res.status(HttpResponseCode.OK).send('Location added');
		} catch (err) {
			res.status(HttpResponseCode.INTERNAL_ERROR).send('Failed to add location');
		}
	}
}
