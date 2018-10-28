import { CacheCollection } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { User } from "../../../../db/entity/hub";
import { UserCached } from "../objects/userCached";

/**
 * A cached users collection
 */
export class UsersCacheCollection extends CacheCollection<UserCached> {
  /**
   * The amount of time the user collection stays synced (miliseconds).
   * Set to never expire
   */
  protected expiresIn: number = -1;

  /**
   * Syncs all cached users in the collection with the database
   */
  public async sync(): Promise<void> {
    // Fetching the user object from the database
    const users: User[] = await getConnection("hub")
      .getRepository(User)
      .createQueryBuilder("user")
      .getMany();
    // Updating the instance variables
    this.syncedAt = Date.now();
    this.elements = new Map<number, UserCached>();
    users.forEach(user => {
      const syncedUser = new UserCached(user);
      this.elements[syncedUser.id] = syncedUser;
    });
  }
}