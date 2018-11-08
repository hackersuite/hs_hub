import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Challenge } from "../db/entity/hub";
import { Cache } from "../util/cache";

export class ChallengesController {

  public async listChallenges(req: Request, res: Response) {
    res.send(await Cache.challenges.getElements());
  }

  public async createChallenge(req: Request, res: Response, next: NextFunction) {
    const { title, description, company, prizes } = req.body;
    if (!title || !description || !company || !prizes)
      return next(new ApiError(HttpResponseCode.BAD_REQUEST,
        "Not all parameters were specified. Expected: title, description, company, prizes"));
    const descriptionString = String(description);
    const companyString = String(company);
    const prizesString = String(prizes);
    const createdChallengeId = (await getConnection("hub")
      .createQueryBuilder()
      .insert()
      .into(Challenge)
      .values([
        { title,
          description: descriptionString,
          company: companyString,
          prizes: prizesString,
        }
      ])
      .execute()).identifiers[0].id;
    await Cache.challenges.sync();
    res.send(await Cache.challenges.getElement(createdChallengeId));
  }

  public async updateChallenge(req: Request, res: Response, next: NextFunction) {
    const { title, description, company, prizes } = req.body;
    if (!title || !description || !company || !prizes)
      return next(new ApiError(HttpResponseCode.BAD_REQUEST,
        "Not all parameters were specified. Expected: title, description, company, prizes"));
    // Updating the database
    await getConnection("hub")
      .createQueryBuilder()
      .update(Challenge)
      .set({ description, company, prizes })
      .where("title = :titleToUpdate", { titleToUpdate: title })
      .execute();
    // Make the challenges update for the user
    await Cache.challenges.sync();
    const updatedChallenge = (await Cache.challenges.getElements())
                             .find(challenge => challenge.title === title);
    res.send(updatedChallenge);
  }

  public async deleteChallenge(req: Request, res: Response, next: NextFunction) {
    const { title } = req.body;
    if (!title)
      return next(new ApiError(HttpResponseCode.BAD_REQUEST,
        "The challenge's title is not provided. Expected: title"));
    await getConnection("hub")
      .createQueryBuilder()
      .delete()
      .from(Challenge)
      .where("title = :titleToDelete", { titleToDelete: title })
      .execute();
    await Cache.challenges.sync();
    res.send("Challenge ${title} deleted");
  }
}