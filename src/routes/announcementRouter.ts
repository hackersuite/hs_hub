import { Router } from 'express';
import { AnnouncementController } from '../controllers';
import { RouterInterface } from '.';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { RequestAuthenticationV2 } from '../util/auth';

@injectable()
export class AnnouncementRouter implements RouterInterface {
	private readonly _announcementController: AnnouncementController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.AnnouncementController) announcementController: AnnouncementController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._announcementController = announcementController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/announcement';
	}

	public register(): Router {
		const router: Router = Router();

		/**
     * POST /announcement/
     */
		router.post('/',
			this._requestAuth.withAuthMiddleware(this,
				this._announcementController.announce));

		/**
     * POST /announcement/push
     */
		router.post('/push',
			this._requestAuth.withAuthMiddleware(this,
				this._announcementController.pushNotification));

		/**
     * POST /announcement/push/register
     */
		router.post('/push/register',
			this._requestAuth.withAuthMiddleware(this,
				this._announcementController.pushNotificationRegister));

		return router;
	}
}
