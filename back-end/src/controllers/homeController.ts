import { Request, Response, NextFunction } from "express";
import { getAllReservations, getAllHardwareItems } from "../util/hardwareLibrary";
import { Achievements } from "../util/achievements";

/**
 * A controller for auth methods
 */
export class HomeController {
  public dashboard(req: Request, res: Response, next: NextFunction) {
    res.render("pages/dashboard");
  }

  public async hardware(req: Request, res: Response, next: NextFunction) {
    const items = await getAllHardwareItems(req.user.id);
    res.render("pages/hardware", { items });
  }

  public async achievements(req: Request, res: Response, next: NextFunction) {
    const allAchievements = Achievements.getAchievements();
    const progress: Map<string, number> = await Achievements.getUserProgressForAllAchievements(req.user);
    res.render("pages/achievements", { allAchievements: allAchievements, progress: progress });
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