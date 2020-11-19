import { Request, Response, CookieOptions } from 'express';
import { NextFunction } from 'connect';
import { injectable, inject } from 'inversify';
import { createVerificationHmac, linkAccount } from '@unicsmcr/hs_discord_bot_api_client';

export interface UserControllerInterface {
	profile: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * A controller for user methods
 */
@injectable()
export class UserController implements UserControllerInterface {
	public constructor() {
	}

	/**
   * Gets the profile page for the currently logged in user
   */
	public profile = async (req: Request, res: Response) => {
		let profileCookieOptions: CookieOptions|undefined = undefined;
		if (req.app.get('env') === 'production') {
			profileCookieOptions = {
				// TODO: store domain in env vars
				domain: 'greatunihack.com',
				secure: true,
				httpOnly: true
			};
		}

		(profileCookieOptions
			? res.cookie('ReturnTo', process.env.HUB_URL, profileCookieOptions)
			: res.cookie('ReturnTo', process.env.HUB_URL))
			.redirect(process.env.AUTH_URL ?? '');
	};

	public discordJoin = async (req: Request, res: Response) => {
		const state = createVerificationHmac(req.user.id, process.env.DISCORD_HMAC_KEY ?? '');
		const discordURL =
      `https://discordapp.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID ?? ''}` +
      `&redirect_uri=${encodeURIComponent(`${process.env.DISCORD_REDIRECT_URI ?? ''}`)}` +
      `&response_type=code&scope=identify%20guilds.join&state=${state}`;
		res.redirect(302, discordURL);
	};

	public discordAuth = async (req: Request, res: Response) => {
		try {
			await linkAccount(req.user.id, req.query.code, req.query.state);
			res.render('pages/discord', { error: false });
		} catch (err) {
			res.render('pages/discord', { error: true });
		}
	};
}
