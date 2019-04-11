import { Request, Response, NextFunction } from "express";
import { Cache } from "../util/cache";
// import { Achievements } from "../util/achievements";
import { EventCached } from "../util/cache/models/objects";
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
    const events: EventCached[] = await Cache.events.getElements();
    const announcements: Announcement[] = await this.announcementService.getMostRecentAnnouncements(5);
    res.render("pages/dashboard", { events, announcements });
  };

  public async challenges(req: Request, res: Response, next: NextFunction) {
    const challenges = await Cache.challenges.getElements();
    res.render("pages/challenges", { challenges });
  }

  // public async achievements(req: Request, res: Response, next: NextFunction) {
  //   const allAchievements = Achievements.getAchievements();
  //   const progress: Map<string, number> = await Achievements.getUserProgressForAllAchievements(req.user);
  //   res.render("pages/achievements", { allAchievements: allAchievements, progress: progress });
  // }

  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/login", { preventNotificationRequest: true });
  }

  public contacts(req: Request, res: Response, next: NextFunction) {
    res.render("pages/contacts");
  }
}