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

  public dashboard = async (req: Request, res: Response, next: NextFunction) => {
    let events: Event[] = this.cache.getAll(Event.name); // await this.eventService.findAllEvents();
    if (events.length === 0) {
      events = await this.eventService.findAllEvents();
      if (events.length !== 0) this.cache.setAll(Event.name, events);
    }

    let announcements: Announcement[] = this.cache.getAll(Announcement.name);
    if (announcements.length === 0) {
      announcements = await this.announcementService.getMostRecentAnnouncements(5);
      if (announcements.length !== 0) this.cache.setAll(Announcement.name, announcements);
    }

    res.render("pages/dashboard", { events, announcements });
  };

  public challenges = async(req: Request, res: Response, next: NextFunction) => {
    const challenges: Challenge[] = await this.challengeService.getAll();
    res.render("pages/challenges", { challenges: challenges });
  }

  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/login", { preventNotificationRequest: true });
  }

  public contacts(req: Request, res: Response, next: NextFunction) {
    res.render("pages/contacts");
  }
}