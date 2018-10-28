import { CacheObject } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { User } from "../../../../db/entity/hub";

/**
 * A cached user object
 */
export class AchievementProgressCached extends CacheObject {
  public achievementId: string;
  public userId: string;
  public progress: number;


  /**
   * The amount of time the achievement progress object stays synced (miliseconds)
   * Set to 3 minutes
   */
  protected readonly expiresIn: number = 180000;

  constructor(user: User) {
  }

  /**
   * Syncs this cached user object with the database
   */
  public async sync(): Promise<void> {
    // Fetching the user from the database
    const user: User = await getConnection("hub")
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id", { id: this.id })
      .getOne();
    // Updating the instance variables
    this.name = user.name;
    this.email = user.email;
    this.authLevel = user.authLevel;
    this.team = user.team;
    this.repo = user.repo;
    this.syncedAt = Date.now();
  }
}