import { Router } from 'express';
import { ChallengeController } from '../controllers';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { RouterInterface } from '.';
import { RequestAuthenticationV2 } from '../util/auth';

@injectable()
export class ChallengeRouter implements RouterInterface {
	private readonly _challengeController: ChallengeController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.ChallengeController) challengeController: ChallengeController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._challengeController = challengeController;
		this._requestAuth = requestAuth;

	}

	public getPathRoot(): string {
		return '/challenges';
	}

	public register(): Router {
		const router: Router = Router();

		/**
     * GET /challenges/all
     */
		router.get('/all', 
			this._requestAuth.withAuthMiddleware(this, 
				this._challengeController.listChallenges));

		/**
     * POST /challenges/create
     */
		router.post('/create', 			
			this._requestAuth.withAuthMiddleware(this, 
			this._challengeController.createChallenge));

		/**
     * PUT /challenges/update
     */
		router.put('/update', 
			this._requestAuth.withAuthMiddleware(this,
				this._challengeController.updateChallenge));

		/**
     * DELETE /challenges/delete
     */
		router.delete('/delete',
			this._requestAuth.withAuthMiddleware(this, 
				this._challengeController.deleteChallenge));

		return router;
	}
}
