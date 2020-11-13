import { Router } from 'express';
import { HardwareController } from '../controllers/hardwareController';
import { inject, injectable } from 'inversify';
import { RouterInterface } from '.';
import { TYPES } from '../types';
import { RequestAuthenticationV2 } from '../util/auth';

@injectable()
export class HardwareRouter implements RouterInterface {
	private readonly _hardwareController: HardwareController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.HardwareController) hardwareController: HardwareController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._hardwareController = hardwareController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/hardware';
	}

	public register(): Router {
		const router: Router = Router();

		/**
     * GET /hardware
     */
		router.get('/', 
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.library));

		/**
     * POST /hardware
     */
		router.post('/',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.addItem));

		/**
     * GET /hardware/loancontrols
     */
		router.get('/loancontrols',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.loanControls));

		/**
     * GET /hardware/management
     */
		router.get('/management',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.management));

		/**
     * GET /hardware/add
     */
		router.get('/add',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.addPage));

		/**
     * POST /hardware/reserve
     */
		// router.post('/reserve',  
		// 	this._requestAuth.withAuthMiddleware(this, 
		// 		this._hardwareController.reserve));

		/**
     * POST /hardware/cancelReservation
     */
		// router.post('/cancelReservation',  
		// 	this._requestAuth.withAuthMiddleware(this, 
		// 		this._hardwareController.cancelReservation));

		/**
     * POST /hardware/take
     */
		router.post('/take',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.take));

		/**
     * POST /hardware/return
     */
		router.post('/return',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.return));

		/**
     * POST /hardware/addItems
     */
		router.post('/addItems',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.addAllItems));

		/**
     * GET /hardware/allItems
     */
		router.get('/allItems',   
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.getAllItems));

		/**
     * GET /hardware/reservation
     */
		router.get('/reservation/:token',   
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.getReservation));

		/**
     * GET /hardware/reservations
     */
		router.get('/reservations',  
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.getAllReservations));

		/**
     * PUT /hardware/:id
     */
		router.put('/:id',   
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.updateItem));

		/**
     * DELETE /hardware/:id
     */
		router.delete('/:id',   
			this._requestAuth.withAuthMiddleware(this, 
				this._hardwareController.deleteItem));

		return router;
	}
}
