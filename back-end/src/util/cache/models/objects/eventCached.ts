import { CacheObject } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { Event } from "../../../../db/entity/hub";

/**
 * A cached user object
 */
export class EventCached extends CacheObject {

  public title: string;

  public startTime: Date;

  public endTime: Date;

  public location: string;

  /**
   * The amount of time the user object stays synced (miliseconds)
   * Set to -1 second
   */
  protected readonly expiresIn: number = -1;

  /**
   * Creates a cached user object
   * @param id The user's id on the database
   * @param name The user's name
   * @param email The  user's email
   * @param authLevel The user's authorization level
   * @param team The user's team
   * @param repo The repository where the user's hack is hosted
   */
  constructor(event: Event) {
    super(event.id);
    this.title = event.title;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
    this.location = event.location;
  }

  /**
   * Compares this UserCached object to another, returns true if they are equal
   * @param otherEvent The other user to compare
   */
  public isEqualTo(otherEvent: EventCached): boolean {
    return super.isEqualTo(otherEvent) &&
      this.title === otherEvent.title &&
      this.startTime === otherEvent.startTime &&
      this.endTime === otherEvent.endTime &&
      this.location === otherEvent.location;
  }

  /**
   * Syncs this cached user object with the database
   */
  public async sync(): Promise<void> {
    // Fetching the user from the database
    const event: Event = await getConnection("hub")
      .getRepository(Event)
      .createQueryBuilder("event")
      .where("event.id = :id", { id: this.id })
      .getOne();
    // Updating the instance variables
    this.title = event.title;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
    this.location = event.location;
    this.syncedAt = Date.now();
  }
}