import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { Challenge } from "../db/entity/hub";
import { Cache } from "../util/cache";
import { ValidationError, validate } from "class-validator";
import { ChallengeService } from "../services/challenges";

export class ChallengesController {
  private cache: Cache;
  private challengeService: ChallengeService;

  constructor(_cache: Cache, _challengeService: ChallengeService) {
    this.cache = _cache;
    this.challengeService = _challengeService;
  }

  public listChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let challenges: Challenge[] = this.cache.getAll(Challenge.name);

      if (challenges.length === 0) {
        challenges = await this.challengeService.getAll();
        this.cache.setAll(Challenge.name, challenges);
      }

      res.send(challenges);
    } catch (err) {
      return next(err);
    }
  };

  public createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, company, prizes } = req.body;
      const newChallenge: Challenge = new Challenge(title, description, company, prizes);

      const errors: ValidationError[] = await validate(newChallenge);

      if (errors.length > 0) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not create challenge: ${errors.join(",")}`));
      }

      this.challengeService.saveChallenge(newChallenge);
      // Clearing the cache since all challenges in the cache must have
      // the same lifetime and a new item in the cache would have a
      // longer lifetime than the other challenges
      this.cache.deleteAll(Challenge.name);
      res.send(newChallenge);
    } catch (err) {
      return next(err);
    }
  };

  public updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, title, description, company, prizes } = req.body;

      let challengeToUpdate: Challenge = this.cache.get(Challenge.name, Number(id));
      if (!challengeToUpdate) {
        challengeToUpdate = await this.challengeService.findByID(id);
      }

      const updatedChallenge = new Challenge(title, description, company, prizes);
      updatedChallenge.id = challengeToUpdate.id;

      const errors: ValidationError[] = await validate(updatedChallenge);

      if (errors.length > 0) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not update challenge: ${errors.join(",")}`));
      }

      await this.challengeService.saveChallenge(updatedChallenge);
      // Clearing the cache since all challenges in the cache must have
      // the same lifetime and updating an object in the cache
      // resets its lifetime
      this.cache.deleteAll(Challenge.name);
      res.send(updatedChallenge);
    } catch (err) {
      return next(err);
    }
  };

  public deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;

      if (!id)
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          "The id of the challenge to delete was not provided. Expected: id"));

      this.challengeService.deleteChallengeByID(id);
      this.cache.delete(Challenge.name, Number(id));

      res.send(`Chalenge ${id} deleted`);
    } catch (err) {
      return next(err);
    }
  };
}