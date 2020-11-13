import { Repository } from 'typeorm';
import { Event as HubEvent } from '../../db/entity/event';
import { injectable, inject } from 'inversify';
import { EventRepository } from '../../repositories';
import { TYPES } from '../../types';

export interface EventServiceInterface {
	findAllEvents: () => Promise<HubEvent[]>;
	createEvent: (title: string, startTime: Date, endTime: Date, location: string) => Promise<number>;
	deleteEventByID: (eventID: number) => Promise<void>;
}

@injectable()
export class EventService {
	private readonly eventRepository: Repository<HubEvent>;

	public constructor(
	@inject(TYPES.EventRepository) _eventRepository: EventRepository
	) {
		this.eventRepository = _eventRepository.getRepository();
	}

	public findAllEvents = (): Promise<HubEvent[]> => this.eventRepository.find();

	/**
   * @returns Event ID
   */
	public createEvent = async (title: string, startTime: Date, endTime: Date, location: string): Promise<number> => (await this.eventRepository
		.createQueryBuilder()
		.insert()
		.into(HubEvent)
		.values([{
			title,
			startTime,
			endTime,
			location
		}])
		.execute()).identifiers[0].id;

	public deleteEventByID = async (eventID: number): Promise<void> => {
		await this.eventRepository.delete(eventID);
	};
}
