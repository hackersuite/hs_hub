import { Request, Response, NextFunction } from "express";
import { getAllReservations } from "../util/hardwareLibrary";

/**
 * A controller for auth methods
 */
export class HomeController {
  public dashboard(req: Request, res: Response, next: NextFunction) {
    res.render("pages/dashboard");
  }

  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/login");
  }

  public async admin(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await getAllReservations();
      res.render("pages/admin", { reservations: reservations || [] });
    } catch (err) {
      return next(err);
    }
  }
}