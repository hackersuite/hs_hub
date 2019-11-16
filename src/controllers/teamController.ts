import { Request, Response, NextFunction } from "express";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { TeamService } from "../services/teams";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { RequestUser, RequestTeamMembers } from "../util/hs_auth";

export interface TeamControllerInterface {
  manage: (req: Request, res: Response) => void;
  getTeam: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * A controller for team methods
 */
@injectable()
export class TeamController implements TeamControllerInterface {
  private _teamService: TeamService;
  constructor(
    @inject(TYPES.TeamService) teamService: TeamService
  ) {
    this._teamService = teamService;
  }

  /**
   * Redirect the user to manage their team on hs_auth
   */
  public manage = (req: Request, res: Response): void => {
    res.redirect(`${process.env.AUTH_URL}`);
  };

  /**
   * Creates JSON format of the currently logged in users team
   */
  public getTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const reqUser: RequestUser = req.user as RequestUser;
    if (!reqUser.team) return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

    const teamMembers: RequestTeamMembers = await this._teamService.getUsersTeamMembers(reqUser.authToken, reqUser.team);

    const team: Array<Object> = [];
    teamMembers.users.forEach((user: RequestUser) => {
      team.push({
        "name": user.name
      });
    });

    res.send(team);
  };

  /**
   * Creates JSON representation of all the teams and users in the team
   */
  // public getAllTeams = async (req: Request, res: Response, next: Function): Promise<void> => {
  //   const allUserTeams: User[] = await this._teamService.

  //   const teams: Map<string, Object[]> = new Map<string, Object[]>();

  //   allUserTeams.forEach((user: User) => {
  //     if (!teams.has(user.team.teamCode))
  //       teams.set(user.team.teamCode, []);

  //     teams.get(user.team.teamCode).push({
  //       "name": user.name,
  //       "email": user.email
  //     });
  //   });

  //   const teamArray = {};
  //   teams.forEach((v: Object[], k: string) => {
  //     teamArray[k] = v;
  //   });

  //   res.send(teamArray);
  // };

  // public updateRepo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const requestUser: User = req.user as User;
  //   if (!requestUser.team) return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

  //   if (await this.teamService.updateTeamRepository(String(requestUser.team), req.body.repo))
  //     res.send("Updated the teams git repository!");
  //   else
  //     return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to update the team repository."));
  // };

  // public updateTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const requestUser: User = req.user as User;
  //   if (!requestUser.team || !req.body.tableNumber) return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to update the team table number."));

  //   if (await this.teamService.updateTeamTableNumber(String(requestUser.team), req.body.tableNumber))
  //     res.send("Updated the teams table number!");
  //   else
  //     return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to update the team table number."));
  // };

  // public updateName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const requestUser: User = req.user as User;
  //   if (!requestUser.team) return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

  //   if (await this.teamService.updateTeamName(String(requestUser.team), req.body.name))
  //     res.send("Updated the teams name!");
  //   else
  //     return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team name may already be taken"));
  // };
}