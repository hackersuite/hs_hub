import axios from 'axios';
import { Request, Response, CookieOptions } from 'express';
import { NextFunction } from 'connect';
import { inject, injectable } from 'inversify';
import { createVerificationHmac, linkAccount } from '@unicsmcr/hs_discord_bot_api_client';
import { Cache } from '../util/cache';
import { TYPES } from '../types';
import { HttpResponseCode } from '../util/errorHandling';
import { UserContactDetailsService } from '../services/userContactDetails';
import { MapService } from '../services/map';
import { User } from '@unicsmcr/hs_auth_client';
import { MapLocation, UserContactDetails } from '../db/entity';

export interface UserControllerInterface {
	profile: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * A controller for user methods
 */
@injectable()
export class UserController implements UserControllerInterface {
	private readonly _cache: Cache;
	private readonly _contactDetailsService: UserContactDetailsService;
	private readonly _mapService: MapService;

	public constructor(
	@inject(TYPES.Cache) cache: Cache,
		@inject(TYPES.UserContactDetailsService) contactDetailsService: UserContactDetailsService,
		@inject(TYPES.MapService) mapService: MapService
	) {
		this._cache = cache;
		this._contactDetailsService = contactDetailsService;
		this._mapService = mapService;
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

	public twitchStatus = async (req: Request, res: Response) => {
		const twitchCache = 'twitch_status';
		const twitchStatus: any = this._cache.getAll(twitchCache);

		// Use the stream status from cache
		if (twitchStatus && twitchStatus.length > 0) {
		  res.send(twitchStatus[0]['isOnline']);	
		} else {
		  // Get the most up to date stream status
		  let response;
		  try {
				response = await axios.get('https://api.twitch.tv/helix/streams', {
			  	headers: {
					'Client-ID': process.env.TWITCH_CLIENT_ID,
					'Authorization': 'Bearer ' + process.env.TWITCH_TOKEN
			  	},
			  	params: {
					user_login: 'greatunihack'
			  	}
			});
		  } catch (err) {
			res.status(HttpResponseCode.INTERNAL_ERROR).send('Failed to get twitch status');
			return;
		  }
		  const obj: any = {
			id: 1,
			expiresIn: 1000 * 60
		  };
		  const streamOnline = response.data.data && response.data.data.length > 0 && response.data.data[0].type === 'live';
		  obj.isOnline = streamOnline;
		  this._cache.set(twitchCache, obj);

		  res.send(streamOnline);
		}
	  };

	  public intro = async (req: Request, res: Response) => {
		const contactDetails: UserContactDetails = new UserContactDetails();
		contactDetails.userId = (req.user as User).id;
		contactDetails.phone = req.body.phone;
		contactDetails.addr1 = req.body.addrline1;
		contactDetails.addr2 = req.body.addrline2;
		contactDetails.addr3 = req.body.addrline3;
		contactDetails.city = req.body.city;
		contactDetails.spr = req.body.spr;
		contactDetails.zip = req.body.zip;
		contactDetails.country = req.body.country;
		contactDetails.tshirt = req.body.tshirt;
	
		try {
		  await this._contactDetailsService.save(contactDetails);
		  await this._mapService.add(req.body.city, req.body.country);
		  this._cache.deleteAll(MapLocation.name);
		} catch (err) {
		  res.status(HttpResponseCode.INTERNAL_ERROR).send("Failed");
		  return;
		}
		res.send("Done");
	};
}
