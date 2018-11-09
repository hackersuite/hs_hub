import { Request, Response, NextFunction } from "express";
import { getAllReservations, getAllHardwareItems } from "../util/hardwareLibrary";
import { Cache } from "../util/cache";
import { EventCached } from "../util/cache/models/objects";

/**
 * A controller for auth methods
 */
export class HomeController {
  public async dashboard(req: Request, res: Response, next: NextFunction) {
    const events: EventCached[] = await Cache.events.getElements();
    res.render("pages/dashboard", { events, announcements: [] });
  }

  public async hardware(req: Request, res: Response, next: NextFunction) {
    const items = await getAllHardwareItems(req.user.id);
    res.render("pages/hardware", { items });
  }

  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/login");
  }

  public contacts(req: Request, res: Response, next: NextFunction) {
    res.render("pages/contacts");
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