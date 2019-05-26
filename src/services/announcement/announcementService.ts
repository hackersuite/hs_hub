import { Repository } from "typeorm";
import { Announcement } from "../../db/entity/hub";
import { Cache } from "../../util/cache";

export class AnnouncementService {
  private announcementRepository: Repository<Announcement>;
  private cache: Cache;
  constructor(_announcementRepository: Repository<Announcement>, _cache: Cache) {
    this.announcementRepository = _announcementRepository;
    this.cache = _cache;
  }

  public createAnnouncement = async (announcement: Announcement): Promise<void> => {
    await this.announcementRepository.save(announcement);
    this.cache.deleteAll(Announcement.name);
  };

  /**
   * Gets the most announcements from the database, and limits the number returned
   * @param mostRecent The number of announcements to get from the database
   * @returns An array of announcements from the database
   */
  public getMostRecentAnnouncements = async (mostRecent: number): Promise<Announcement[]> => {
    let mostRecentAnnouncements: Announcement[] = undefined;
    const cachedAnnouncements: Announcement[] = this.cache.getAll(Announcement.name);

    // Either there are no announcements or the cache has expired
    if (cachedAnnouncements.length === 0) {
      try {
        mostRecentAnnouncements = await this.announcementRepository
          .createQueryBuilder("announcement")
          .orderBy("announcement.createdAt", "DESC")
          .limit(mostRecent)
          .getMany();
      } catch (err) {
        throw new Error(`Failed to get the most recent announcements: ${err}`);
      }
      if (mostRecentAnnouncements !== undefined) {
        this.cache.setAll(Announcement.name, mostRecentAnnouncements);
      }
      return mostRecentAnnouncements;
    } else {
      return cachedAnnouncements;
    }
  };
}