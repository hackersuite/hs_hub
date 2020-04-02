import { Request, Response, NextFunction } from "express";
import * as passport from "passport";
import * as querystring from "querystring";

import { AuthLevels } from "./authLevels";
import { RequestUser } from "../hs_auth";
import { genHmac } from "../crypto";

export const checkIsLoggedIn = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate(
    "cookie",
    {
      session: false
    },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      // There is not authenticated user, so redirect to logins
      if (!user) {
        const queryParam: string = querystring.stringify({
          returnto: `${process.env.HUB_URL}${req.originalUrl}`
        });
        res.redirect(`${process.env.AUTH_URL}/login?${queryParam}`);
        return;
      }
      if (user.authLevel >= AuthLevels.Volunteer)
        res.locals.isVolunteer = true;
      if (user.authLevel >= AuthLevels.Organizer)
        res.locals.isOrganizer = true;

      const state = Buffer.from(`${user.authId}:${genHmac(user.authId)}`).toString('base64');
      res.locals.discordAuthURL =
        `https://discordapp.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(`${process.env.HUB_URL}/user/discord_authentication`)}` +
        `&response_type=code&scope=identify%20guilds.join&state=${state}`;
      res.locals.authLevel = user.authLevel;
      return next();
    }
  )(req, res, next);
};

const checkAuthLevel = (req: Request, res: Response, user: RequestUser, requiredAuth: AuthLevels): boolean => {
  if (!user || user.authLevel < requiredAuth) {
    const queryParam: string = querystring.stringify({ returnto: `${process.env.HUB_URL}${req.originalUrl}` });
    res.redirect(`${process.env.AUTH_URL}/login?${queryParam}`);
    return;
  }
  return true;
};

export const checkIsAttendee = (req: Request, res: Response, next: NextFunction): void => {
  if (checkAuthLevel(req, res, req.user as RequestUser, AuthLevels.Attendee)) {
    res.locals.isAttendee = true;
    return next();
  }
};

export const checkIsOrganizer = (req: Request, res: Response, next: NextFunction): void => {
  if (checkAuthLevel(req, res, req.user as RequestUser, AuthLevels.Organizer)) {
    res.locals.isOrganizer = true;
    res.locals.isVolunteer = true;
    return next();
  }
};

export const checkIsVolunteer = (req: Request, res: Response, next: NextFunction): void => {
  if (checkAuthLevel(req, res, req.user as RequestUser, AuthLevels.Volunteer)) {
    res.locals.isVolunteer = true;
    return next();
  }
};