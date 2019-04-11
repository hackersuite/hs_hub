import { Announcement } from "../../db/entity/hub";
import { Repository } from "typeorm";

export class AnnouncementService {
  private announcementRepository: Repository<Announcement>;

  constructor(_announcementRepository: Repository<Announcement>) {
    this.announcementRepository = _announcementRepository;
  }

  createAnnouncement = async (announcement: Announcement): Promise<void> => {
    this.announcementRepository.save(announcement);
  };

}