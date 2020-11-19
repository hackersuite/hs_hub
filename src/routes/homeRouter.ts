import { Router } from 'express';
import { HomeController } from '../controllers';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { RouterInterface } from '.';
import { RequestAuthenticationV2 } from '../util/auth';

@injectable()
export class HomeRouter implements RouterInterface {
	private readonly _homeController: HomeController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.HomeController) homeController: HomeController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._homeController = homeController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/';
	}

	public register(): Router {
		const router: Router = Router();

		router.get('/contacts',
			this._requestAuth.withAuthMiddleware(this,
				this._homeController.contacts));

		router.get('/challenges',
			this._requestAuth.withAuthMiddleware(this,
				this._homeController.challenges));

		router.get('/',
			this._requestAuth.withAuthMiddleware(this,
				this._homeController.dashboard));

		return router;
	}
}
