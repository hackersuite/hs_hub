import { Router } from 'express';
import { RouterInterface } from '.';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { AchievementsController } from '../controllers';
import { RequestAuthenticationV2 } from '../util/auth';

@injectable()
export class AchievementsRouter implements RouterInterface {
	private readonly _achievementsController: AchievementsController;
	private readonly _requestAuth: RequestAuthenticationV2;

	public constructor(@inject(TYPES.AchievementsController) achievementsController: AchievementsController,
		@inject(TYPES.RequestAuthenticationV2) requestAuth: RequestAuthenticationV2) {
		this._achievementsController = achievementsController;
		this._requestAuth = requestAuth;
	}

	public getPathRoot(): string {
		return '/achievements';
	}

	public register(): Router {
		const router: Router = Router();

		/**
     * GET /achievements
     * Returns all implemented achievements
     */
		router.get('/',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.getAchievementsPage));


		/**
     * GET /achievements/volunteercontrols
     * Returns all implemented achievements
     */
		router.get('/volunteercontrols',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.getVolunteersPage));

		/**
     * GET /achievements/progress
     * Returns the user's progress on all achievements
     */
		router.get('/progress',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.getProgressForAllAchievements));

		/**
     * GET /achievements/:id/progress
     * Returns the user's progress on a specific achievement
     */
		router.get('/:id/progress',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.getProgressForAchievement));

		/**
     * PUT /achievements/:id/complete
     * Sets the user's progress on the achievement to completed
     */
		router.put('/:id/complete',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.completeAchievementForUser));


		/**
     * PUT /api/achievements/:id/complete
     * Sets the user's progress on the achievement to completed (meant for API access)
     */
		router.put('/:id/api/complete',
			this._requestAuth.withAPIAuthMiddleware(this,
				this._achievementsController.apiCompleteAchievementForUser));


		/**
     * GET /achievements/:id/step/:step?token=:token
     * Increments the user's progress on a specific achievement
     */
		router.get('/:id/step/:step',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.completeAchievementStep));

		/**
     * PUT /achievements/:id/complete
     * Sets the user's prizeClaimed on the achievement to true
     */
		router.put('/:id/giveprize',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.givePrizeToUser));

		/**
     * PUT /achievements/:id/complete
     * Sets the user's prizeClaimed on the achievement to true
     */
		router.get('/token/:id/:step',
			this._requestAuth.withAuthMiddleware(this,
				this._achievementsController.getAchievementToken));

		return router;
	}
}
