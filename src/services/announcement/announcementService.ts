import { Repository } from "typeorm";
import { Announcement } from "../../db/entity";
import { Cache } from "../../util/cache";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { AnnouncementRepository } from "../../repositories";

export interface AnnouncementServiceInterface {
  createAnnouncement: (announcement: Announcement) => Promise<void>;
  getMostRecentAnnouncements: (mostRecent: number) => Promise<Announcement[]>;
}

@injectable()
export class AnnouncementService {
  private _announcementRepository: Repository<Announcement>;
  private _cache: Cache;

  constructor(
    @inject(TYPES.AnnouncementRepository) announcementRepository: AnnouncementRepository,
    @inject(TYPES.Cache) cache: Cache) {
    this._announcementRepository = announcementRepository.getRepository();
    this._cache = cache;
  }

  public createAnnouncement = async (announcement: Announcement): Promise<void> => {
    await this._announcementRepository.save(announcement);
    this._cache.deleteAll(Announcement.name);
  };

  /**
   * Gets the most announcements from the database, and limits the number returned
   * @param mostRecent The number of announcements to get from the database
   * @returns An array of announcements from the database
   */
  public getMostRecentAnnouncements = async (mostRecent: number): Promise<Announcement[]> => {
    let mostRecentAnnouncements: Announcement[] = undefined;
    const cachedAnnouncements: Announcement[] = this._cache.getAll(Announcement.name);

    // Either there are no announcements or the cache has expired
    if (cachedAnnouncements.length === 0) {
      try {
        mostRecentAnnouncements = await this._announcementRepository
          .createQueryBuilder("announcement")
          .orderBy("announcement.createdAt", "DESC")
          .limit(mostRecent)
          .getMany();
      } catch (err) {
        throw new Error(`Failed to get the most recent announcements: ${err}`);
      }
      if (mostRecentAnnouncements !== undefined) {
        this._cache.setAll(Announcement.name, mostRecentAnnouncements);
      }
      return mostRecentAnnouncements;
    } else {
      return cachedAnnouncements;
    }
  };
}