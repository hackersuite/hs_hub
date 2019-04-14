import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Challenge } from "../db/entity/hub";
import { Cache } from "../util/cache";
import { ValidationError, validate } from "class-validator";

export class ChallengesController {
  private cache: Cache;

  constructor(_cache: Cache) {
    this.cache = _cache;
  }

  public listChallenges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let challenges: Challenge[] = this.cache.getAll(Challenge.name);

      if (challenges.length === 0) {
        challenges = await getConnection("hub").getRepository(Challenge).find();
        this.cache.setAll(Challenge.name, challenges);
      }

      res.send(challenges);
    } catch (err) {
      return next(err);
    }
  }

  public createChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, company, prizes } = req.body;
      const newChallenge: Challenge = new Challenge(title, description, company, prizes);

      const errors: ValidationError[] = await validate(newChallenge);

      if (errors.length > 0) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not create challenge: ${errors.join(",")}`));
      }

      await getConnection("hub").getRepository(Challenge).save(newChallenge);
      // Clearing the cache since all challenges in the cache must have
      // the same lifetime and a new item in the cache would have a
      // longer lifetime than the other challenges
      this.cache.deleteAll(Challenge.name);
      res.send(newChallenge);
    } catch (err) {
      return next(err);
    }
  }

  public updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, title, description, company, prizes } = req.body;

      let challengeToUpdate: Challenge = this.cache.get(Challenge.name, Number(id));
      if (!challengeToUpdate) {
        challengeToUpdate = await getConnection("hub").getRepository(Challenge).findOne(id);
        if (!challengeToUpdate) {
          return next(new ApiError(HttpResponseCode.BAD_REQUEST,
            `Could not find challenge with given id`));
        }
      }

      const updatedChallenge = new Challenge(title, description, company, prizes);
      updatedChallenge.id = challengeToUpdate.id;

      const errors: ValidationError[] = await validate(updatedChallenge);

      if (errors.length > 0) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not update challenge: ${errors.join(",")}`));
      }

      await getConnection("hub").getRepository(Challenge).save(updatedChallenge);
      // Clearing the cache since all challenges in the cache must have
      // the same lifetime and updating an object in the cache
      // resets its lifetime
      this.cache.deleteAll(Challenge.name);
      res.send(updatedChallenge);
    } catch (err) {
      return next(err);
    }
  }

  public deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;

      if (!id)
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          "The id of the challenge to delete was not provided. Expected: id"));

      await getConnection("hub")
        .createQueryBuilder()
        .delete()
        .from(Challenge)
        .where("id = :id", { id })
        .execute();


      this.cache.delete(Challenge.name, Number(id));

      res.send(`Chalenge ${id} deleted`);
    } catch (err) {
      return next(err);
    }
  }
}