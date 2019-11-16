import { Router } from "express";
import { checkIsOrganizer, checkIsLoggedIn } from "../util/user";
import { ChallengeController } from "../controllers";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { RouterInterface } from ".";

@injectable()
export class ChallengeRouter implements RouterInterface {
  private _challengeController: ChallengeController;

  public constructor(@inject(TYPES.ChallengeController) challengeController: ChallengeController) {
    this._challengeController = challengeController;
  }

  public getPathRoot(): string {
    return "/challenges";
  }

  public register(): Router {
    const router: Router = Router();

    router.use(checkIsLoggedIn);

    /**
     * GET /challenges/all
     */
    router.get("/all", this._challengeController.listChallenges);

    /**
     * POST /challenges/create
     */
    router.post("/create", checkIsOrganizer, this._challengeController.createChallenge);

    /**
     * PUT /challenges/update
     */
    router.put("/update", checkIsOrganizer, this._challengeController.updateChallenge);

    /**
     * DELETE /challenges/delete
     */
    router.delete("/delete", checkIsOrganizer, this._challengeController.deleteChallenge);

    return router;
  }
};