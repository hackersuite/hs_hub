import { Router } from "express";
import { TeamController } from "../controllers/teamController";
import { checkIsLoggedIn, checkIsVolunteer } from "../util/user";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { RouterInterface } from ".";

@injectable()
export class TeamRouter implements RouterInterface {
  private _teamController: TeamController;

  public constructor(@inject(TYPES.TeamController) teamController: TeamController) {
    this._teamController = teamController;
  }

  public getPathRoot(): string {
    return "/team";
  }

  public register(): Router {
    const router: Router = Router();

    /**
     * GET /team/manage
     */
    router.get("/manage", checkIsLoggedIn, this._teamController.manage);

    /**
     * GET /team/getAllTeams
     */
    // router.get("/getAllTeams", checkIsVolunteer, this._teamController.getAllTeams);

    /**
     * GET /team/getTeam
     */
    router.get("/getTeam", checkIsLoggedIn, this._teamController.getTeam);

    return router;
  }
};