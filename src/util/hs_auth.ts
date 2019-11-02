import * as request from "request-promise-native";
import { Express, Request, Response, Application, NextFunction, CookieOptions } from "express";
import passport = require("passport");
import { injectable, inject } from "inversify";
import * as CookieStrategy from "passport-cookie";

import { HttpResponseCode } from "./errorHandling";
import { Cache } from "./cache";
import { TYPES } from "../types";

// The done function has the parameters (error, user, info)

export interface RequestAuthenticationInterface {
  passportSetup: (app: Application) => void;
}

export type RequestUser = {
  authId: string;
  authLevel: number;
  name: string;
  email: string;
  team: string;
};

@injectable()
export class RequestAuthentication {

  private _cache: Cache;

  public constructor( @inject(TYPES.Cache) cache: Cache ) {
    this._cache = cache;
  }

  private logout = (app: Express): void => {
    let logoutCookieOptions: CookieOptions = undefined;
    if (app.get("env") === "production") {
      logoutCookieOptions = {
        domain: app.locals.settings.rootDomain,
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

            (req.user as RequestUser) = {
              authId: result.user._id,
              authLevel: result.user.auth_level,
              name: result.user.name,
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

