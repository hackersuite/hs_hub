import { CacheCollection } from "../../abstract-classes";
import { getConnection } from "typeorm";
import { Challenge } from "../../../../db/entity";
import { ChallengeCached } from "../objects/challengeCached";

/**
 * Cached challenges collection
 */
export class ChallengesCacheCollection extends CacheCollection<ChallengeCached> {
  /**
   * The amount of time the challenge collection stays synced (miliseconds).
   * Set to never expire
   */
  protected expiresIn: number = -1;

  /**
   * Syncs all cached challenges in the collection with the database
   */
  public async sync(): Promise<void> {
    // Get challenge from database
    const challenges: Challenge[] = await getConnection("hub")
      .getRepository(Challenge)
      .createQueryBuilder("challenge")
      .whereInIds(Array.from(this.elements.keys()))
      .getMany();
    // Updating the instance variables
    this.syncedAt = Date.now();
    this.elements = new Map<number, ChallengeCached>();
    challenges.forEach(challenge => {
      const syncedChallenge = new ChallengeCached(challenge);
      this.elements[syncedChallenge.id] = syncedChallenge;
    });
  }
}