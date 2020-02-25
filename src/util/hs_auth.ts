import { Express, Request, Response, Application, CookieOptions } from "express";
import passport = require("passport");
import { injectable, inject } from "inversify";
import * as CookieStrategy from "passport-cookie";

import { Cache } from "./cache";
import { TYPES } from "../types";
import { UserService } from "../services/users";
import { User } from "../db/entity";
import { getCurrentUser, RequestUser as AuthRequestUser } from "@unicsmcr/hs_auth_client";

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
  tableNumber?: number;
}

export interface RequestTeam {
  _id: string;
  name: string;
  creator: string;
  table_no?: number;
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
          let apiResult: AuthRequestUser;
          try {
            apiResult = await getCurrentUser(token, req.originalUrl);
          } catch (err) {
            // Some internal error has occured
            return done(err);
          }
          // We expect the result to be returned as JSON, parse it
            // The request has been authorized

          // Check if the user exists in the hub...if not, then add them
          let user: User = undefined;
          const authId: string = apiResult.authId;
          const name: string = apiResult.name;
          try {
            user = await this._userService.getUserByAuthIDFromHub(apiResult.authId);
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
            authLevel: apiResult.authLevel,
            name: name,
            email: apiResult.email,
            team: apiResult.team
          };
          return done(undefined, req.user);
        }
      )
    );
  };
}

