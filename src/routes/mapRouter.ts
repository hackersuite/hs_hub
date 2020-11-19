import { Router } from 'express';
import { RouterInterface } from '.';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { MapController } from '../controllers';
import { RequestAuthenticationV2 } from '../util/auth';

@injectable()
export class MapRouter implements RouterInterface {
	private readonly _mapController: MapController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(
	@inject(TYPES.MapController) mapController: MapController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2
	) {
		this._mapController = mapController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/map';
	}

	public register(): Router {
		const router: Router = Router();

		/**
     * GET /map/get
     * Returns all the locations of the hackers
     */
		router.get('/get', this._requestAuth.withAuthMiddleware(this, this._mapController.getAllLocations));

		/**
     * POST /map
     * Adds a location to the map
     */
		router.post('/', this._requestAuth.withAuthMiddleware(this, this._mapController.addLocation));

		return router;
	}
}
