import { CacheObject } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { User } from "../../../../db/entity/hub";

/**
 * A cached user object
 */
export class UserCached extends CacheObject {
  /**
   * The user's name
   */
  public name: string;
  /**
   * The user's email
   */
  public email: string;
  /**
   * The user's authorization level
   */
  public authLevel: number;
  /**
   * The user's team
   */
  public team: string;
  /**
   * The repository where the user hosts their hack
   */
  public repo: string;

  /**
   * The amount of time the user object stays synced (miliseconds)
   * Set to 1 second
   */
  protected readonly expiresIn: number = 1000;

  /**
   * Creates a cached user object
   * @param id The user's id on the database
   * @param name The user's name
   * @param email The  user's email
   * @param authLevel The user's authorization level
   * @param team The user's team
   * @param repo The repository where the user's hack is hosted
   */
  constructor(user: User) {
    super(user.id);
    this.name = user.name;
    this.email = user.email;
    this.authLevel = user.authLevel;
    this.team = user.team;
    this.repo = user.repo;
  }

  /**
   * Compares this UserCached object to another, returns true if they are equal
   * @param otherUser The other user to compare
   */
  public isEqualTo(otherUser: UserCached): boolean {
    return super.isEqualTo(otherUser) &&
      this.name === otherUser.name &&
      this.email === otherUser.email &&
      this.authLevel === otherUser.authLevel &&
      this.team === otherUser.team &&
      this.repo === otherUser.repo;
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