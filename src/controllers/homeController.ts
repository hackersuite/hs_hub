import { Request, Response, NextFunction } from "express";
import { getAllReservations, getAllHardwareItems } from "../util/hardwareLibrary";
// import { Achievements } from "../util/achievements";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { AuthLevels } from "../util/user";

/**
 * A controller for auth methods
 */
export class HomeController {
  public async dashboard(req: Request, res: Response, next: NextFunction) {
    const announcements: Announcement[] = await getConnection("hub")
      .getRepository(Announcement)
      .createQueryBuilder("announcement")
      .orderBy("announcement.createdAt", "DESC")
      .limit(5)
      .getMany();
    // TODO: re-implement the list of events when the service architecture refactor is finished
    res.render("pages/dashboard", { events: [], announcements });
  }

  public async challenges(req: Request, res: Response, next: NextFunction) {
    // TODO: re-implement the list of challenges when the service architecture refactor is finished
    res.render("pages/challenges", { challenges: [] });
  }

  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/login", { preventNotificationRequest: true });
  }

  public contacts(req: Request, res: Response, next: NextFunction) {
    res.render("pages/contacts");
  }
}