import { Repository } from "typeorm";
import { Event as HubEvent } from "../../db/entity/hub/event";

export class EventService {
  private eventRepository: Repository<HubEvent>;

  constructor(_eventRepository: Repository<HubEvent>) {
    this.eventRepository = _eventRepository;
  }

  findAllEvents = async (): Promise<HubEvent[]> => {
    return await this.eventRepository.find();
  };

  /**
   * @returns Event ID
   */
  createEvent = async (title: string, startTime: Date, endTime: Date, location: string): Promise<number> => {
    return (await this.eventRepository
      .createQueryBuilder()
      .insert()
      .into(HubEvent)
      .values([{
        title,
        startTime,
        endTime,
        location
      }]).execute()).identifiers[0].id;
  };
}