import { Request, Response } from "express";
import * as passport from "passport";
import { ApiError } from "../util/errorHandling";
import { HttpResponseCode } from "../util/errorHandling";

/**
 * A controller for auth methods
 */
export class UserController {
  /**
   * Logs in the user
   */
  public login(req: Request, res: Response, next: Function): void {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
      }
      if (!user) {
        return next(new ApiError(HttpResponseCode.UNAUTHORIZED, info.message));
      }
      req.logIn(user, (err: any) => {
        if (err) {
          return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
        }
        res.send({ message: "Logged in" });
      });
    })(req, res);
  }

  /**
   * Logs out the user
   */
  public logout(req: Request, res: Response): void {
    req.logout();
    res.send({ message: "Logged out" });
  }

  /**
   * Used for testing purposes, to be removed in next pull request
   */
  public test(req: Request, res: Response): void {
    res.send({ message: "Authorized" });
  }
}