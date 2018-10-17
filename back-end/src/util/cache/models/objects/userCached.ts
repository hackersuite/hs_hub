import { CacheObject } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { User } from "../../../../db/entity";

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
  protected expiresIn: number = 1000;

  /**
   * Creates a cached user object
   * @param id The user's id on the database
   * @param name The user's name
   * @param email The  user's email
   * @param authLevel The user's authorization level
   * @param team The user's team
   * @param repo The repository where the user's hack is hosted
   */
  constructor(id: number, name: string, email: string, authLevel: number, team: string, repo: string) {
    super(id);
    this.name = name;
    this.email = email;
    this.authLevel = authLevel;
    this.team = team;
    this.repo = repo;
  }

  /**
   * Syncs this cached user object with the database
   */
  public async sync(): Promise<void> {
    // Fetching the user from the database
    const user: User = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id", { id: this.id })
      .getOne();
    // Updating the instance variables
    const { name, email, authLevel, team, repo } = user;
    this.name = name;
    this.email = email;
    this.authLevel = authLevel;
    this.team = team;
    this.repo = repo;
    this.syncedAt = Date.now();
  }
}