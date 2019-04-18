import { Request, Response, NextFunction } from "express";
import { Cache } from "../util/cache";
import { Announcement, Event, Challenge } from "../db/entity/hub";
import { AnnouncementService } from "../services/announcement";
import { EventService } from "../services/events";
import { ChallengeService } from "../services/challenges";

/**
 * A controller for auth methods
 */
export class HomeController {
  private cache: Cache;

  private announcementService: AnnouncementService;
  private eventService: EventService;
  private challengeService: ChallengeService;
  constructor(_cache: Cache, _announcementService: AnnouncementService, _eventService: EventService, _challengeService: ChallengeService) {
    this.cache = _cache;
    this.announcementService = _announcementService;
    this.eventService = _eventService;
    this.challengeService = _challengeService;
  }

  dashboard = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: re-implement the list of events when the service architecture refactor is finished
    const events: Event[] = await this.eventService.findAllEvents();
    const announcements: Announcement[] = await this.announcementService.getMostRecentAnnouncements(5);
    res.render("pages/dashboard", { events, announcements });
  };

  public async challenges(req: Request, res: Response, next: NextFunction) {
    const challenges: Challenge[] = await this.challengeService.getAll();
    res.render("pages/challenges", { challenges: [] });
  }

  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/login", { preventNotificationRequest: true });
  }

  public contacts(req: Request, res: Response, next: NextFunction) {
    res.render("pages/contacts");
  }
}