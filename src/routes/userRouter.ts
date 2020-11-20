import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { RouterInterface } from '.';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { RequestAuthenticationV2 } from '../util/auth';

/**
 * A router for handling the user
 */
@injectable()
export class UserRouter implements RouterInterface {
	private readonly _userController: UserController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.UserController) userController: UserController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._userController = userController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/user';
	}

	public register(): Router {
		const router: Router = Router();

		/**
	 * GET /user/profile
	 */
		router.get('/profile',
			this._requestAuth.withAuthMiddleware(this,
				this._userController.profile));

		router.get('/join_discord',
			this._requestAuth.withAuthMiddleware(this,
				this._userController.discordJoin));

		router.get('/discord_authentication',
			this._requestAuth.withAuthMiddleware(this,
				this._userController.discordAuth));

		router.get('/twitch',
			this._requestAuth.withAuthMiddleware(this,
				this._userController.twitchStatus));

		router.post("/intro",
			this._requestAuth.withAuthMiddleware(this,
				this._userController.intro));

		return router;
	}
}
