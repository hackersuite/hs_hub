import { Request, Response, CookieOptions } from "express";
import { NextFunction } from "connect";
import { TeamService } from "../services/teams/teamService";
import { injectable, inject } from "inversify";
import { RequestUser, RequestTeam, RequestTeamMembers, Team } from "../util/hs_auth";
import { TYPES } from "../types";
import { UserService } from "../services/users";
import axios from "axios";
import { genHmac } from "../util/crypto";

export interface UserControllerInterface {
  profile: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * A controller for user methods
 */
@injectable()
export class UserController implements UserControllerInterface {
  private _teamService: TeamService;

  constructor(
    @inject(TYPES.TeamService) teamService: TeamService
  ) {
    this._teamService = teamService;
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
        domain: "greatunihack.com",
        secure: true,
        httpOnly: true
      };
    }

    res.cookie("ReturnTo", process.env.HUB_URL, profileCookieOptions)
      .redirect(process.env.AUTH_URL);
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
    const state = Buffer.from(`${req.user.authId}:${genHmac(req.user.authId)}`).toString('base64');
    const discordURL =
      `https://discordapp.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(`${process.env.DISCORD_REDIRECT_URI}`)}` +
      `&response_type=code&scope=identify%20guilds.join&state=${state}`;
    res.redirect(discordURL, 302);
  };

  public discordAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await axios.get(`${process.env.DISCORD_HS_API_BASE}/api/v1/discord`, {
        params: req.query
      });
      res.render("pages/discord", { error: false });
    } catch(err) {
      res.render("pages/discord", { error: true }); 
    }
  };
}