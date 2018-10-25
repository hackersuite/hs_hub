import { Request, Response } from "express";
import * as passport from "passport";

/**
 * A controller for auth methods
 */
export class UserController {
  /**
   * Logs in the user
   */
  public login(req: Request, res: Response, next: Function): void {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) { return res.status(401).json(err); }
      if (!user) { return res.status(401).json({ message: info.message }); }
      req.logIn(user, (err: any) => {
        if (err) { return next(err); }
        res.send({ message: user.email });
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
}