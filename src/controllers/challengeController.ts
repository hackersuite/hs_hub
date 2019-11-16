import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { Challenge } from "../db/entity";
import { Cache } from "../util/cache";
import { ValidationError, validate } from "class-validator";
import { ChallengeService } from "../services/challenges";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";

export interface ChallengeControllerInterface {
  listChallenges: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  createChallenge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  updateChallenge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  deleteChallenge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
export class ChallengeController implements ChallengeControllerInterface {
  private _cache: Cache;
  private _challengeService: ChallengeService;

  constructor(
    @inject(TYPES.Cache) cache: Cache,
    @inject(TYPES.ChallengeService) challengeService: ChallengeService
  ) {
    this._cache = cache;
    this._challengeService = challengeService;
  }

  public listChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let challenges: Challenge[] = this._cache.getAll(Challenge.name);

      if (challenges.length === 0) {
        challenges = await this._challengeService.getAll();
        this._cache.setAll(Challenge.name, challenges);
      }

      res.send(challenges);
    } catch (err) {
      next(err);
    }
  };

  public createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, company, prizes } = req.body;
      const newChallenge: Challenge = new Challenge(title, description, company, prizes);

      const errors: ValidationError[] = await validate(newChallenge);

      if (errors.length > 0) {
        next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not create challenge: ${errors.join(",")}`));
        return;
      }

      this._challengeService.saveChallenge(newChallenge);
      // Clearing the cache since all challenges in the cache must have
      // the same lifetime and a new item in the cache would have a
      // longer lifetime than the other challenges
      this._cache.deleteAll(Challenge.name);
      res.send(newChallenge);
    } catch (err) {
      next(err);
    }
  };

  public updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, title, description, company, prizes } = req.body;

      let challengeToUpdate: Challenge = this._cache.get(Challenge.name, Number(id));
      if (!challengeToUpdate) {
        challengeToUpdate = await this._challengeService.findByID(id);
      }

      const updatedChallenge = new Challenge(title, description, company, prizes);
      updatedChallenge.id = challengeToUpdate.id;

      const errors: ValidationError[] = await validate(updatedChallenge);

      if (errors.length > 0) {
        next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not update challenge: ${errors.join(",")}`));
          return;
      }

      await this._challengeService.saveChallenge(updatedChallenge);
      // Clearing the cache since all challenges in the cache must have
      // the same lifetime and updating an object in the cache
      // resets its lifetime
      this._cache.deleteAll(Challenge.name);
      res.send(updatedChallenge);
    } catch (err) {
      next(err);
    }
  };

  public deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;

      if (!id) {
        next(new ApiError(HttpResponseCode.BAD_REQUEST,
          "The id of the challenge to delete was not provided. Expected: id"));
        return;
      }

      this._challengeService.deleteChallengeByID(id);
      this._cache.delete(Challenge.name, Number(id));

      res.send(`Chalenge ${id} deleted`);
    } catch (err) {
      next(err);
    }
  };
}