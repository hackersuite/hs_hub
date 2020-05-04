import { Request, Response, CookieOptions } from "express";
import { NextFunction } from "connect";
import { TeamService } from "../services/teams/teamService";
import { injectable, inject } from "inversify";
import { RequestUser, RequestTeam, RequestTeamMembers, Team } from "../util/hs_auth";
import { TYPES } from "../types";
import { UserService } from "../services/users";
import { createVerificationHmac, linkAccount } from "@unicsmcr/hs_discord_bot_api_client";
import axios from "axios";
import { Cache, Cacheable } from "../util/cache";
import { HttpResponseCode } from "../util/errorHandling";
import { User } from "../db/entity";
import { MapService } from "../services/map";
import { getAllUsers } from "@unicsmcr/hs_auth_client";

export interface UserControllerInterface {
  profile: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * A controller for user methods
 */
@injectable()
export class UserController implements UserControllerInterface {
  private _userService: UserService;
  private _mapService: MapService;
  private _cache: Cache;

  constructor(
    @inject(TYPES.Cache) cache: Cache,
    @inject(TYPES.UserService) userService: UserService,
    @inject(TYPES.MapService) mapService: MapService
  ) {
    this._userService = userService;
    this._mapService = mapService;
    this._cache = cache;
  }

  /**
   * Logs in the user
   */
  // public login = (req: Request, res: Response, next: NextFunction): void => {
  //   passport.authenticate("local", (err: Error, user: any, info: any) => {
  //     if (err) {
  //       return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
  //     }
  //     if (!user) {
  //       return res.status(HttpResponseCode.BAD_REQUEST).render("pages/login", { error: info.message });
  //     }
  //     req.logIn(user, (err: any) => {
  //       let redirectRoute: string;

  //       if (err) {
  //         return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
  //       }
  //       if (user.authLevel >= AuthLevels.Volunteer)
  //         res.locals.isVolunteer = true;
  //       if (user.authLevel >= AuthLevels.Organizer)
  //         res.locals.isOrganizer = true;
  //       if (user.authLevel > AuthLevels.Attendee) {
  //         redirectRoute = "/hardware/loancontrols";
  //       } else {
  //         redirectRoute = "/";
  //       }
  //       redirectRoute = req.session.redirectTo || redirectRoute;
  //       delete req.session.redirectTo;
  //       res.redirect(redirectRoute);
  //     });
  //   })(req, res);
  // };

  /**
   * Gets the profile page for the currently logged in user
   */
  public profile = async (req: Request, res: Response, next: NextFunction) => {
    let profileCookieOptions: CookieOptions = undefined;
    if (req.app.get("env") === "production") {
      profileCookieOptions = {
        domain: "studenthack2020.com",
        secure: true,
        httpOnly: true
      };
    }

    res.cookie("ReturnTo", process.env.HUB_URL, profileCookieOptions).redirect(process.env.AUTH_URL);
    // let reqUser: RequestUser = req.user as RequestUser;
    // let teamInfo: Team = undefined;
    // if (reqUser.team) {
    //   try {
    //     teamInfo = await this._teamService.getTeam(reqUser.authToken, reqUser.team);
    //     console.log(teamInfo);
    //   } catch (err) {
    //     return new Error("Failed to get profile");
    //   }
    // }
    // console.log(teamInfo);

    // res.render("pages/profile", { user: reqUser, teamMembers: teamInfo.users, teamInfo: teamInfo });
  };

  public discordJoin = async (req: Request, res: Response, next: NextFunction) => {
    const state = createVerificationHmac(req.user.authId, process.env.DISCORD_HMAC_KEY);
    const discordURL =
      `https://discordapp.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(`${process.env.DISCORD_REDIRECT_URI}`)}` +
      `&response_type=code&scope=identify%20guilds.join&state=${state}`;
    res.redirect(302, discordURL);
  };

  public discordAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await linkAccount(req.user.authId, req.query.code, req.query.state);
      res.render("pages/discord", { error: false, discordUrl: response.url });
    } catch (error) {
      res.render("pages/discord", { error: error.response?.data?.message || error.message });
    }
  };

  public twitchStatus = async (req: Request, res: Response) => {
    const twitchCache = "twitch_status";
    const twitchStatus = this._cache.getAll(twitchCache);

    // Use the stream status from cache
    if (twitchStatus && twitchStatus.length > 0) {
      res.send(twitchStatus[0]["isOnline"]);
      return;
    } else {
      // Get the most up to date stream status
      let response;
      try {
        response = await axios.get("https://api.twitch.tv/helix/streams", {
          headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID
          },
          params: {
            user_login: "studenthack"
          }
        });
      } catch (err) {
        res.status(HttpResponseCode.INTERNAL_ERROR).send("Failed to get twitch status");
        return;
      }
      const obj: Cacheable = {
        id: 1,
        expiresIn: 1000 * 60
      };

      const streamOnline = response.data && response.data.data.length > 0;
      obj["isOnline"] = streamOnline;
      this._cache.set(twitchCache, obj);

      res.send(streamOnline);
    }
  };

  public intro = async (req: Request, res: Response) => {
    const currentUser = req.user.hubUser as User;
    currentUser.completed_intro = true;

    currentUser.addr1 = req.body.addrline1;
    currentUser.addr2 = req.body.addrline2;
    currentUser.addr3 = req.body.addrline3;
    currentUser.city = req.body.city;
    currentUser.spr = req.body.spr;
    currentUser.zip = req.body.zip;
    currentUser.country = req.body.country;
    currentUser.tshirt = req.body.tshirt;
    currentUser.sex = req.body.sex;

    try {
      await this._userService.save(currentUser);
    } catch (err) {
      res.status(HttpResponseCode.INTERNAL_ERROR).send("Failed");
      return;
    }
    res.send("Done");
  };

  public tempMLH = async (req: Request, res: Response) => {
    const auth_users: RequestUser[] = await getAllUsers(req.user.authToken);
    const users: User[] = await this._userService.getAllUsers();

    const joinedUsers = [];
    for (const hubUser of users) {
      let foundUser: RequestUser = undefined;
      for (const authUser of auth_users) {
        if (authUser.authId === hubUser.authId) {
          foundUser = authUser;
          break;
        }
      }

      if (foundUser) {
        joinedUsers.push({
          name: foundUser.name,
          email: foundUser.email,
          university: hubUser.university
        });
      }
    }

    let data = JSON.stringify(joinedUsers);
    res.setHeader("Content-disposition", "attachment; filename= sh_users.json");
    res.setHeader("Content-type", "application/json");
    res.write(data, function (err) {
      res.end();
    });
  };
}
