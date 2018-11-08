import { CacheCollection } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { Event } from "../../../../db/entity/hub";
import { EventCached } from "../objects";

/**
 * A cached event collection
 */
export class EventsCacheCollection extends CacheCollection<EventCached> {
  /**
   * The amount of time the event collection stays synced (miliseconds).
   * Set to never expire
   */
  protected expiresIn: number = -1;

  /**
   * Syncs all cached events in the collection with the database
   */
  public async sync(): Promise<void> {
    // Fetchig the event object from the database
    const events: Event[] = await getConnection("hub")
      .getRepository(Event)
      .createQueryBuilder("event")
      .whereInIds(Array.from(this.elements.keys()))
      .getMany();
    // Updating the instance variables
    this.syncedAt = Date.now();
    this.elements = new Map<string, EventCached>();
    events.forEach(event => {
      const syncedUser = new EventCached(event);
      this.elements[syncedUser.id] = syncedUser;
    });
  }
}