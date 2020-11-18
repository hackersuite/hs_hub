import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import querystring from 'querystring';
import { injectable, inject } from 'inversify';
import CookieStrategy from 'passport-cookie';

import { TYPES } from '../../types'; 
import { AuthApi, User } from '@unicsmcr/hs_auth_client';
import { RouterInterface } from '../../routes';

const AUTH_COOKIE = "Authorization";
const HS_AUTH = process.env.AUTH_URL;
const HS_HUB = process.env.HUB_URL;

export interface RequestAuthenticationV2Interface {
	passportSetup(app: Express): void;
	withAuthMiddleware(router: RouterInterface, operationHandler: ExpressOpHandlerFunction): AuthMiddlewareFunction<unknown>;
	handleUnauthorized(req: Request, res: Response): void;
	getUserAuthToken(req: Request): string;
}

type AuthMiddlewareFunction<T> = (req: Request, res: Response, next: NextFunction) => Promise<T>;
type ExpressOpHandlerFunction = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

@injectable()
export class RequestAuthenticationV2 {
  private readonly _authApi: AuthApi;

	public constructor(
    @inject(TYPES.AuthApi) authApi: AuthApi
    ) {
      this._authApi = authApi;
    }

	private logout(app: Express): void {
		app.get('/logout', (req: Request, res: Response) => {
			return res.redirect(`${HS_AUTH}/logout`);
		});
	}

	public passportSetup(app: Express): void {
		this.logout(app);

		app.use(passport.initialize());
		passport.use(
			new CookieStrategy(
				{
					cookieName: AUTH_COOKIE,
					passReqToCallback: true
				},
				// Defines the callback function which is executed after the cookie strategy is completed
				// We call the API endpoint on hs_auth to return the user based on the token
				async (req: Request, token: string, done: (error?: string, user?: any) => void): Promise<void> => {
					let apiResult: User;
					try {
						apiResult = await this._authApi.getCurrentUser(token);
					} catch (err) {
						return done(undefined, undefined);
					}

					return done(undefined, apiResult);
				}
			)
		);
	}
  
  private authenticate(req: Request, res: Response): Promise<User> {
		return new Promise((resolve, reject) => {
			passport.authenticate('cookie', { session: false }, (err: any, user?: User) => {
				if (err) reject(new Error(err));
				else if (!user) reject(new Error('Not authenticated'));
				resolve(user);
			})(req, res);
		});
	}

	public withAuthMiddleware(router: RouterInterface, operationHandler: ExpressOpHandlerFunction): AuthMiddlewareFunction<unknown> {
		return async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
      const userAuth = this.authenticate(req, res);

			const requestedUri = this.getUriFromRequest(router, operationHandler, req);
      const resourceAuth = this._authApi.getAuthorizedResources(this.getUserAuthToken(req), [requestedUri]);
      

			try {
        const [user, permissions] = await Promise.all([userAuth, resourceAuth]);
				if (permissions.length === 0) {
					return this.handleUnauthorized(req, res);
				}
				req.user = user;
			} catch (err) {
				return this.handleUnauthorized(req, res);
			}

			return operationHandler(req, res, next);
		};
	}

	public handleUnauthorized(req: Request, res: Response): void {
		const queryParam: string = querystring.stringify({ returnto: `${HS_HUB}${req.originalUrl}` });
		res.redirect(`${HS_AUTH}/login?${queryParam}`);
	}

	public getUserAuthToken(req: Request): string {
		return req.cookies[AUTH_COOKIE];
	}

	// TODO: Add arguments to the URI (See https://github.com/unicsmcr/hs_apply/issues/75)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private getUriFromRequest(router: RouterInterface, operationHandler: ExpressOpHandlerFunction, _req: Request): string {
		const routerName = Reflect.getPrototypeOf(router).constructor.name.replace('Router', '');
		const opHandlerParts = operationHandler.name.split(' ');
		const opHandlerName = opHandlerParts[opHandlerParts.length - 1];

		return this._authApi.newUri(`${routerName}:${opHandlerName}`);
	}
}