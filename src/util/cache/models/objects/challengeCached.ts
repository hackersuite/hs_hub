import { CacheObject } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { Challenge } from "../../../../db/entity/hub";

/**
 * A cached challenge object
 */
export class ChallengeCached extends CacheObject {
  /**
   * Challenge's title
   */
  public title: string;
  /**
   * Description of the challenge
   */
  public description: string;
  /**
   * Which company set the challenge
   */
  public company: string;
  /**
   * Challenge's prizes
   */
  public prizes: string;

  /**
   * Challenge object expiration time, default 10000 ms
   */
  protected readonly expiresIn: number = 10000;

  /**
   * Creates a cached challenge object
   * @param id Challenge id from the database
   * @param title Challenge title
   * @param description Challenge description
   * @param company Company which made the challenge
   * @param prizes Challenge prizes
   */
  constructor(challenge: Challenge) {
      super(String(challenge.id));
      this.title = challenge.title;
      this.description = challenge.description;
      this.company = challenge.company;
      this.prizes = challenge.prizes;
  }

  /**
   * Syncs with the database
   */
  public async sync(): Promise<void> {
      // Get challenge from db
      const challenge: Challenge = await getConnection("hub")
      .getRepository(Challenge)
      .createQueryBuilder("challenge")
      .where("challenge.id = :id", { id: this.id })
      .getOne();
      // Updating the instance variables
      this.title = challenge.title;
      this.description = challenge.description;
      this.company = challenge.company;
      this.prizes = challenge.prizes;
      this.syncedAt = Date.now();
  }
}