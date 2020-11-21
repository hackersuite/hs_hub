import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { ApiError, HttpResponseCode } from '../util/errorHandling';
import { Announcement } from '../db/entity';
import { sendOneSignalNotification } from '../util/announcement';
import { AnnouncementService } from '../services/announcement/announcementService';
import { UserService } from '../services/users';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

export interface AnnouncementControllerInterface {
	announce: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	pushNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	pushNotificationRegister: (req: Request, res: Response) => Promise<void>;
}

/**
 * A controller for the announcement methods
 */
@injectable()
export class AnnouncementController implements AnnouncementControllerInterface {
	private readonly _announcementService: AnnouncementService;
	private readonly _userService: UserService;

	public constructor(
	@inject(TYPES.AnnouncementService) announcementService: AnnouncementService,
		@inject(TYPES.UserService) userService: UserService
	) {
		this._announcementService = announcementService;
		this._userService = userService;
	}

	public announce = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const message = req.body.message;
			if (!message) {
				throw new ApiError(HttpResponseCode.BAD_REQUEST, 'No message provided!');
			} else if (message.length > 255) {
				throw new ApiError(HttpResponseCode.BAD_REQUEST, 'Message too long!');
			}
			const announcement = new Announcement(message);
			await this._announcementService.createAnnouncement(announcement);
			res.send(announcement);
		} catch (error) {
			next(error);
		}
	};

	/**
   * This function will either send a push notifation to all users subscribed to push notifications
   * or to only those users whose ids are provided.
   *
   * If you want to send to particular users, then include the ids in the post request with the following format:
   * included_users = {"users": ["userId1", "userId2", ...]}
   * @param req
   * @param res
   * @param next
   */
	public pushNotification = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const text: string = req.body.message;
			const includedUsers: string|undefined = req.body.included_users;
			let userIds: string[] = [];
			if (includedUsers !== undefined) {
				const includedUsersObj: Record<string, any> = JSON.parse(includedUsers);
				if (includedUsersObj.hasOwnProperty('users')) {
					userIds = includedUsersObj.users;
				}
			}

			const result = await sendOneSignalNotification(text, userIds);
			if (result.hasOwnProperty('errors')) {
				res.status(HttpResponseCode.INTERNAL_ERROR).send(`Failed to send the push notification!. ${JSON.stringify(result)}`);
			} else {
				res.send(result);
			}
		} catch (error) {
			next(error);
		}
	};

	public async pushNotificationRegister(req: Request, res: Response) {
		res.status(501).send('Not Implemented');
		// try {
		// 	const playerID: string = req.body.data;
		// 	await this._userService.addPushIDToUser(req.user as User, playerID);
		// 	res.status(200).send(`Updated with player ID: ${playerID}`);
		// } catch (error) {
		// 	next(error);
		// }
	}
}
