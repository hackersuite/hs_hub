import { Repository } from "typeorm";
import { Challenge } from "../../db/entity";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";
import { inject, injectable } from "inversify";
import { ChallengeRepository } from "../../repositories";
import { TYPES } from "../../types";

export interface ChallengeServiceInterface {
  getAll: () => Promise<Challenge[]>;
  findByID: (challengeID: number) => Promise<Challenge>;
  saveChallenge: (challenge: Challenge) => Promise<void>;
  deleteChallengeByID: (id: number) => Promise<void>;
}

@injectable()
export class ChallengeService implements ChallengeServiceInterface {
  private challengeRepository: Repository<Challenge>;

  constructor(@inject(TYPES.ChallengeRepository) _challengeRepository: ChallengeRepository) {
    this.challengeRepository = _challengeRepository.getRepository();
  }

  public getAll = async (): Promise<Challenge[]> => {
    return this.challengeRepository.find();
  };

  public findByID = async (challengeID: number): Promise<Challenge> => {
    const challenge: Challenge = await this.challengeRepository.findOne(challengeID);
    if (!challenge) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, `Could not find challenge with given id ${challengeID}`);
    }
    return challenge;
  };

  public saveChallenge = async (challenge: Challenge): Promise<void> => {
    await this.challengeRepository.save(challenge);
  };

  public deleteChallengeByID = async (id: number): Promise<void> => {
    await this.challengeRepository
      .createQueryBuilder()
      .delete()
      .where("id = :id", { id })
      .execute();
  };
}