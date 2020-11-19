import { Router } from 'express';
import { ScheduleController } from '../controllers';
import { injectable, inject } from 'inversify';
import { RouterInterface } from '.';
import { TYPES } from '../types';
import { RequestAuthenticationV2 } from '../util/auth';

/**
 * A router for handling the schedule
 */
@injectable()
export class ScheduleRouter implements RouterInterface {
	private readonly _scheduleController: ScheduleController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.ScheduleController) scheduleController: ScheduleController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._scheduleController = scheduleController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/schedule';
	}

	public register(): Router {
		const router: Router = Router();

		/**
     * POST /schedule/create
     */
		router.post('/create',
			this._requestAuth.withAuthMiddleware(this,
				this._scheduleController.createEvent));

		/**
     * POST /schedule/delete
     */
		router.delete('/delete',
			this._requestAuth.withAuthMiddleware(this,
				this._scheduleController.deleteEvent));

		/**
     * POST /schedule/update
     */
		router.put('/update',
			this._requestAuth.withAuthMiddleware(this,
				this._scheduleController.updateEvent));

		/**
     * GET /schedule/
     */
		router.get('/',
			this._requestAuth.withAuthMiddleware(this,
				this._scheduleController.listEvents));

		return router;
	}
}
