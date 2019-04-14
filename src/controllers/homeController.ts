import { Request, Response, NextFunction } from "express";
import { Cache } from "../util/cache";
// import { Achievements } from "../util/achievements";
import { Announcement } from "../db/entity/hub";
import { AnnouncementService } from "../services/announcement";

/**
 * A controller for auth methods
 */
export class HomeController {
  private announcementService: AnnouncementService;
  constructor(_announcementService: AnnouncementService) {
    this.announcementService = _announcementService;
  }

  dashboard = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: re-implement the list of events when the service architecture refactor is finished
    const announcements: Announcement[] = await this.announcementService.getMostRecentAnnouncements(5);
    res.render("pages/dashboard", { events: [], announcements });
  };

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