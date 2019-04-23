import { Repository } from "typeorm";
import { Challenge } from "../../db/entity/hub";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";

export class ChallengeService {
  private challengeRepository: Repository<Challenge>;

  constructor(_challengeRepository: Repository<Challenge>) {
    this.challengeRepository = _challengeRepository;
  }

  getAll = async (): Promise<Challenge[]> => {
    return this.challengeRepository.find();
  };

  findByID = async (challengeID: number): Promise<Challenge> => {
    const challenge: Challenge = await this.challengeRepository.findOne(challengeID);
    if (!challenge) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, `Could not find challenge with given id ${challengeID}`);
    }
    return challenge;
  };

  saveChallenge = async (challenge: Challenge): Promise<void> => {
    await this.challengeRepository.save(challenge);
  };

  deleteChallengeByID = async (id: number): Promise<void> => {
    await this.challengeRepository
      .createQueryBuilder()
      .delete()
      .where("id = :id", { id })
      .execute();
  };
}