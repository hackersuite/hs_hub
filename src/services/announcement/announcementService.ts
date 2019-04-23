import { Repository } from "typeorm";
import { Announcement } from "../../db/entity/hub";

export class AnnouncementService {
  private announcementRepository: Repository<Announcement>;

  constructor(_announcementRepository: Repository<Announcement>) {
    this.announcementRepository = _announcementRepository;
  }

  createAnnouncement = async (announcement: Announcement): Promise<void> => {
    await this.announcementRepository.save(announcement);
  };

  /**
   * Gets the most announcements from the database, and limits the number returned
   * @param mostRecent The number of announcements to get from the database
   * @returns An array of announcements from the database
   */
  getMostRecentAnnouncements = async (mostRecent: number): Promise<Announcement[]> => {
    try {
      const mostRecentAnnouncements: Announcement[] = await this.announcementRepository
      .createQueryBuilder("announcement")
      .orderBy("announcement.createdAt", "DESC")
      .limit(mostRecent)
      .getMany();
      return (mostRecentAnnouncements !== undefined ? mostRecentAnnouncements : []);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };
}