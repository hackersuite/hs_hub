import { Request, Response, NextFunction } from 'express';
import { Cache } from '../util/cache';
import { Announcement, Event, Challenge } from '../db/entity';
import { AnnouncementService } from '../services/announcement';
import { EventService } from '../services/events';
import { ChallengeService } from '../services/challenges';
import { injectable, inject } from 'inversify';
import { TYPES } from '../types';

export interface HomeControllerInterface {
	dashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	challenges: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	contacts: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * A controller for home page methods
 */
@injectable()
export class HomeController implements HomeControllerInterface {
	private readonly _cache: Cache;

	private readonly _announcementService: AnnouncementService;
	private readonly _eventService: EventService;
	private readonly _challengeService: ChallengeService;
	public constructor(
	@inject(TYPES.Cache) cache: Cache,
		@inject(TYPES.AnnouncementService) announcementService: AnnouncementService,
		@inject(TYPES.EventService) eventService: EventService,
		@inject(TYPES.ChallengeService) challengeService: ChallengeService
	) {
		this._cache = cache;
		this._announcementService = announcementService;
		this._eventService = eventService;
		this._challengeService = challengeService;
	}

	public dashboard = async (req: Request, res: Response) => {
		let events: Event[] = this._cache.getAll(Event.name); // await this.eventService.findAllEvents();
		if (events.length === 0) {
			events = await this._eventService.findAllEvents();
			if (events.length !== 0) this._cache.setAll(Event.name, events);
		}
		const announcements: Announcement[] = await this._announcementService.getMostRecentAnnouncements(5);

		res.render('pages/dashboard', { events, announcements });
	};

	public challenges = async (req: Request, res: Response) => {
		const challenges: Challenge[] = await this._challengeService.getAll();
		res.render('pages/challenges', { challenges: challenges });
	};

	public contacts = (req: Request, res: Response): void => {
		res.render('pages/contacts');
	};
}
