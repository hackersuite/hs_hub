import { Request, Response, NextFunction } from 'express';
import { AchievementsService, AchievementsProgressService } from '../services/achievements';
import { Achievement } from '../util/achievements';
import { AchievementProgress } from '../db/entity';
import { ApiError, HttpResponseCode } from '../util/errorHandling';
import { UserService } from '../services/users';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { User } from '@unicsmcr/hs_auth_client';

export interface AchievementsControllerInterface {
	getAchievementsPage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getVolunteersPage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getAllAchievements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getProgressForAllAchievements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getProgressForAchievement: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	completeAchievementForUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	completeAchievementStep: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	givePrizeToUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getAchievementToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * A controller for the achievements methods
 */
@injectable()
export class AchievementsController implements AchievementsControllerInterface {
	private readonly _achievementsService: AchievementsService;
	private readonly _achievementsProgressService: AchievementsProgressService;
	private readonly _userService: UserService;

	public constructor(
	@inject(TYPES.AchievementsService) achievementsService: AchievementsService,
		@inject(TYPES.AchievementsProgressService) achievementsProgressService: AchievementsProgressService,
		@inject(TYPES.UserService) userService: UserService
	) {
		this._achievementsService = achievementsService;
		this._achievementsProgressService = achievementsProgressService;
		this._userService = userService;
	}

	public getAchievementsPage = async (req: Request, res: Response, next: NextFunction) => {
		try {
			let achievements: Achievement[] = await this._achievementsService.getAchievements();
			achievements = achievements.sort((a: Achievement, b: Achievement) => a.getTitle().localeCompare(b.getTitle()));
			const achievementsProgress: AchievementProgress[] = await this._achievementsProgressService.getAchievementsProgressForUser((req.user as User).id);

			const progressMap: Map<number, AchievementProgress> = new Map<number, AchievementProgress>();
			achievementsProgress.forEach((achievementProgress: AchievementProgress) => {
				progressMap.set(achievementProgress.getAchievementId(), achievementProgress);
			});

			const notification = req.session?.notification;
			if (req.session) req.session.notification = undefined;

			res.render('pages/achievements/index', { achievements, progress: progressMap, notification });
		} catch (err) {
			next(err);
		}
	};

	public getVolunteersPage = async (req: Request, res: Response, next: NextFunction) => {
		try {
			let users: User[] = await this._userService.getAllUsers();
			users = users.sort((a: User, b: User) => a.name.localeCompare(b.name));

			const usersMap: Map<string, User> = new Map();
			users.forEach((user: User) => {
				usersMap.set(user.id, user);
			})

			let achievements: Achievement[] = await this._achievementsService.getAchievements();
			achievements = achievements.sort((a: Achievement, b: Achievement) => a.getTitle().localeCompare(b.getTitle()));

			let prizesToClaim: AchievementProgress[] = await this._achievementsProgressService.getAchievementsProgressThatCanClaimPrize();
			prizesToClaim = prizesToClaim.sort((a: AchievementProgress, b: AchievementProgress) => {
				const achievementsComparison: number = a.getAchievement().getTitle().localeCompare(b.getAchievement().getTitle());
				if (achievementsComparison === 0 && usersMap.get(a.userId) !== undefined && usersMap.get(b.userId) !== undefined) {
					return usersMap.get(a.userId)!.name.localeCompare(usersMap.get(b.userId)!.name);
				}
				return achievementsComparison;
			});

			const notification = req.session?.notification;
			if (req.session) req.session.notification = undefined;

			res.render('pages/achievements/volunteerControls', { users: usersMap, achievements, prizesToClaim, notification });
		} catch (err) {
			next(err);
		}
	};


	public getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const achievements: Achievement[] = await this._achievementsService.getAchievements();
			res.send(achievements);
		} catch (err) {
			next(err);
		}
	};

	public getProgressForAllAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const progress: AchievementProgress[] =
        await this._achievementsProgressService.getAchievementsProgressForUser((req.user as User).id);
			res.send(progress);
		} catch (err) {
			next(err);
		}
	};

	public getProgressForAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const achievement: Achievement = await this._achievementsService.getAchievementWithId(Number(req.params.id));
			const progress: AchievementProgress = await this._achievementsProgressService.getAchievementProgressForUser(achievement, (req.user as User).id);

			res.send(progress);
		} catch (err) {
			next(err);
		}
	};

	public completeAchievementForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const achievement: Achievement = await this._achievementsService.getAchievementWithId(Number(req.params.id));

			const { userId } = req.body;
			if (userId === undefined) { throw new ApiError(HttpResponseCode.BAD_REQUEST, `Please provide a userId!`); }
			await this._achievementsProgressService.setAchievementCompleteForUser(achievement, userId);
			const user: User = await this._userService.getUserWithId(req.body.userId);

			// TODO: fix push notification
			// await sendPushNotificationByUserID(`Congratulations you have completed the achievement ${achievement.getTitle()}!`, userId);

			if (req.session) {
				req.session.notification = {
					type: 'success',
					message: `Achievement ${achievement.getTitle()} has been awarded to user ${user.name}!`
				};
			}

			res.send({ message: `Achievement ${achievement.getTitle()} has been awarded to user ${user.name}!` });
		} catch (err) {
			next(err);
		}
	};

	public completeAchievementStep = async (req: Request, res: Response): Promise<void> => {
		try {
			const achievement: Achievement = await this._achievementsService.getAchievementWithId(Number(req.params.id));

			const { step } = req.params;
			const token = decodeURIComponent(req.query.token);

			if (step === undefined) { throw new ApiError(HttpResponseCode.BAD_REQUEST, `Please provide a step to complete!`); }

			const achievementProgress: AchievementProgress = await this._achievementsProgressService.completeAchievementStepForUser(Number(step), token, achievement, (req.user as User).id);

			let message: string;
			if (achievementProgress.achievementIsCompleted()) {
				message = `Congratulations! You have completed the achievement ${achievement.getTitle()}! Check out the schedule to find out when you'll be able to claim your prize.`;
			} else {
				message = `Progress for achievement "${achievement.getTitle()}" updated. Your new progress is: ${achievementProgress.getProgress()}/${achievement.getMaxProgress()}!`;
			}

			if (req.session) {
				req.session.notification = {
					type: 'success',
					message
				};
			}

			res.redirect('/achievements');
		} catch (err) {
			if (req.session) {
				req.session.notification = {
					type: 'danger',
					message: err.message
				};
			}

			res.redirect('/achievements');
		}
	};

	public givePrizeToUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const achievement: Achievement = await this._achievementsService.getAchievementWithId(Number(req.params.id));

			const user: User = await this._userService.getUserWithId(req.body.userId);

			await this._achievementsProgressService.giveAchievementPrizeToUser(achievement, user.id);

			if (req.session) {
				req.session.notification = {
					type: 'success',
					message: `Prize for achievement ${achievement.getTitle()} awarded to user ${user.name}`
				};
			}

			res.send({ message: `Prize for achievement ${achievement.getTitle()} awarded to user ${user.name}` });
		} catch (err) {
			if (req.session) {
				req.session.notification = {
					type: 'danger',
					message: err.message
				};
			}

			res.redirect('/achievements');
		}
	};

	public getAchievementToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const achievement: Achievement = await this._achievementsService.getAchievementWithId(Number(req.params.id));

			res.send({ message: encodeURIComponent(achievement.generateToken(req.params.step)) });
		} catch (err) {
			next(err);
		}
	};
}
