import * as request from "request-promise-native";
import { Express, Request, Response, Application, CookieOptions } from "express";
import passport = require("passport");
import { injectable, inject } from "inversify";
import * as CookieStrategy from "passport-cookie";

import { HttpResponseCode } from "./errorHandling";
import { Cache } from "./cache";
import { TYPES } from "../types";
import { UserService } from "../services/users";
import { User } from "../db/entity";
import { AuthLevels } from "./user";

// The done function has the parameters (error, user, info)

export interface RequestAuthenticationInterface {
  passportSetup: (app: Application) => void;
}

export type RequestUser = {
  hubUser?: User;
  authToken?: string;
  authId: string;
  authLevel: number;
  name: string;
  email: string;
  team: string;
};

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

  private _cache: Cache;
  private _userService: UserService;

  public constructor(
    @inject(TYPES.Cache) cache: Cache,
    @inject(TYPES.UserService) userService: UserService
  ) {
    this._cache = cache;
    this._userService = userService;
  }

  private logout = (app: Express): void => {
    let logoutCookieOptions: CookieOptions = undefined;
    if (app.get("env") === "production") {
      logoutCookieOptions = {
        domain: "greatunihack.com",
        secure: true,
        httpOnly: true
      };
    }

    app.get("/logout", function(req: Request, res: Response) {
      res.cookie("Authorization", "", logoutCookieOptions);
      return res.redirect("/");
    });
  };

  public passportSetup = (app: Express): void => {
    this.logout(app);

    app.use(passport.initialize());
    passport.use(
      new CookieStrategy(
        {
          cookieName: "Authorization",
          passReqToCallback: true
        },
        async (req: Request, token: string, done: (error: string, user?: any) => void): Promise<void> => {
          let apiResult: string;
          try {
            apiResult = await request.get(`${process.env.AUTH_URL}/api/v1/users/me`, {
              headers: {
                Authorization: `${token}`,
                Referer: req.originalUrl
              }
            });
          } catch (err) {
            // Some internal error has occured
            return done(err);
          }
          // We expect the result to be returned as JSON, parse it
          const result = JSON.parse(apiResult);
          if (result.error && result.status === HttpResponseCode.UNAUTHORIZED) {
            // When there is an error message and the status code is 401
            return done(undefined, false);
          } else if (result.status === 0) {
            // The request has been authorized

            // Check if the user exists in the hub...if not, then add them
            let user: User = undefined;
            let authId: string = result.user._id;
            let name: string = result.user.name;
            try {
              user = await this._userService.getUserByAuthIDFromHub(result.user._id)
            } catch (err) {
              // The user does not exist yet in the Hub so add them!
              user = new User();
              user.authId = authId;
              user.name = name;
              user = await this._userService.insertNewHubUserToDatabase(user);
            }

            (req.user as RequestUser) = {
              hubUser: user,
              authToken: token,
              authId: authId,
              authLevel: result.user.auth_level,
              name: name,
              email: result.user.email,
              team: result.user.team
            };
            return done(undefined, req.user);
          }
        }
      )
    );
  };
}

