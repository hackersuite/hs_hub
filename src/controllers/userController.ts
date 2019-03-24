import { Request, Response } from "express";
import * as passport from "passport";
import { ApiError } from "../util/errorHandling";
import { HttpResponseCode } from "../util/errorHandling";
import { AuthLevels } from "../util/user";
import { NextFunction } from "connect";
import { getUsersTeamMembers, getUsersTeamRepo } from "../util/team/teamValidation";
import { User } from "../db/entity/hub/user";

/**
 * A controller for auth methods
 */
export class UserController {
  /**
   * Logs in the user
   */
  public login(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
      }
      if (!user) {
        return res.render("pages/login", { error: info.message });
      }
      req.logIn(user, (err: any) => {
        if (err) {
          return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
        }
        if (user.authLevel >= AuthLevels.Volunteer)
          res.locals.isVolunteer = true;
        if (user.authLevel >= AuthLevels.Organizer)
          res.locals.isOrganizer = true;
        if (user.authLevel > AuthLevels.Attendee) {
          res.redirect("/hardware/management");
        } else {
          res.redirect("/");
        }
      });
    })(req, res);
  }

  /**
   * Gets the profile page for the currently logged in user
   */
  public async profile(req: Request, res: Response) {
    let userTeam: User[] = undefined;
    let userTeamRepo: string = undefined;

    if (req.user.team) {
      userTeam = await getUsersTeamMembers(req.user.team);
      userTeamRepo = await getUsersTeamRepo(req.user.team);
    }

    const team: Array<Object> = [];
    if (userTeam) {
      userTeam.forEach((user: User) => {
        team.push({ "name": user.name });
      });
    }

    res.render("pages/profile", { user: req.user, team: team, teamRepo: userTeamRepo });
  }

  /**
   * Logs out the user
   */
  public logout(req: Request, res: Response): void {
    req.logout();
    res.redirect("/login");
  }

  /**
   * Used for testing purposes, to be removed in next pull request
   */
  public test(req: Request, res: Response): void {
    res.send({ message: "Authorized" });
  }
}