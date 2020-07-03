import { Express, Request, Response, CookieOptions } from 'express';
import passport from 'passport';
import { injectable, inject } from 'inversify';
import CookieStrategy from 'passport-cookie';

import { HttpResponseCode } from './errorHandling';
import { Cache } from './cache';
import { TYPES } from '../types';
import { UserService } from '../services/users';
import { User } from '../db/entity';

import * as client from '@unicsmcr/hs_auth_client';

// The done function has the parameters (error, user, info)

export interface RequestAuthenticationInterface {
	passportSetup: (app: Express) => void;
}

export interface RequestUser {
	hubUser?: User;
	authToken?: string;
	authId: string;
	authLevel: number;
	name: string;
	email: string;
	team?: string;
}

export interface Team extends RequestTeamMembers {
	id: string;
	name: string;
	creator: string;
	tableNumber: number;
}

export interface RequestTeam {
	_id: string;
	name: string;
	creator: string;
	table_no: number;
}

export interface RequestTeamMembers {
	users: RequestUser[];
}

@injectable()
export class RequestAuthentication {
	private readonly _cache: Cache;
	private readonly _userService: UserService;

	public constructor(
	@inject(TYPES.Cache) cache: Cache,
		@inject(TYPES.UserService) userService: UserService
	) {
		this._cache = cache;
		this._userService = userService;
	}

	private readonly logout = (app: Express): void => {
		let logoutCookieOptions: CookieOptions;
		if (app.get('env') === 'production') {
			logoutCookieOptions = {
				domain: 'greatunihack.com',
				secure: true,
				httpOnly: true
			};
		}

		app.get('/logout', (req: Request, res: Response) => {
			res.cookie('Authorization', '', logoutCookieOptions);
			return res.redirect('/');
		});
	};

	public passportSetup = (app: Express): void => {
		this.logout(app);

		app.use(passport.initialize());
		passport.use(
			new CookieStrategy(
				{
					cookieName: 'Authorization',
					passReqToCallback: true
				},
				async (req: Request, token: string, done: (error?: string, user?: any) => void): Promise<void> => {
					let user;
					try {
						user = await client.getCurrentUser(token, req.originalUrl);
					} catch (err) {
						if (err?.response?.status === HttpResponseCode.UNAUTHORIZED) {
							// When there is an error message and the status code is 401
							return done(undefined, false);
						}
						// Some internal error has occured
						return done(err);
					}
					// The request has been authorized

					// Check if the user exists in the hub...if not, then add them
					const authId: string = user.id;
					const name: string = user.name;
					let hubUser;
					try {
						hubUser = await this._userService.getUserByAuthIDFromHub(user.id);
					} catch (err) {
						// The user does not exist yet in the Hub so add them!
						hubUser = new User();
						hubUser.authId = authId;
						hubUser.name = name;
						hubUser = await this._userService.insertNewHubUserToDatabase(hubUser);
					}

					(req.user as RequestUser) = {
						hubUser,
						authToken: token,
						authId,
						authLevel: user.authLevel,
						name: name,
						email: user.email,
						team: user.team
					};
					return done(undefined, req.user);
				}
			)
		);
	};
}
