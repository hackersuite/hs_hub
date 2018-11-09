import { Request, Response, NextFunction } from "express";
import { getAllReservations, getAllHardwareItems } from "../util/hardwareLibrary";
import { Cache } from "../util/cache";
import { EventCached } from "../util/cache/models/objects";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { Achievements } from "../util/achievements";

/**
 * A controller for auth methods
 */
export class HomeController {
  public async dashboard(req: Request, res: Response, next: NextFunction) {
    const events: EventCached[] = await Cache.events.getElements();
    const announcements: Announcement[] = await getConnection("hub")
      .getRepository(Announcement)
      .createQueryBuilder("announcement")
      .orderBy("announcement.createdAt", "DESC")
      .limit(5)
      .getMany();
    res.render("pages/dashboard", { events, announcements });
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