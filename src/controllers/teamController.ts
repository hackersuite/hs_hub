import * as crypto from "crypto";

import { Request, Response } from "express";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { User, Team } from "../db/entity/hub";
import { NextFunction } from "connect";
import { TeamService } from "../services/teams";
import { UserService } from "../services/users";

/**
 * A controller for team methods
 */
export class TeamController {
  private teamService: TeamService;
  private userService: UserService;
  constructor(_teamService: TeamService, _userService: UserService) {
    this.teamService = _teamService;
    this.userService = _userService;
  }

  /**
   * Creates a new team, returning a custom team code
   */
  public create = async (req: Request, res: Response, next: Function): Promise<void> => {
    const requestUser: User = req.user as User;
    const createdTeamName: String = await this.teamService.createTeam();
    if (createdTeamName) {
      if (await this.teamService.joinTeam(requestUser.id, createdTeam.teamCode)) {
        res.send("Created new team");
        return;
      }
    }
    return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to create team."));
  };

  /**
   * Leaves the users current team
   */
  public leave = async (req: Request, res: Response, next: Function): Promise<void> => {
    const requestUser: User = req.user as User;
    if (await this.teamService.leaveTeam(requestUser.id, requestUser.team)) {
      res.send("Left the team successfully.");
      return;
    }
    return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to leave team."));
  };

  /**
   * Joins the team specified by the teamcode
   */
  public join = async (req: Request, res: Response, next: Function): Promise<void> => {
    const requestUser: User = req.user as User;
    if (req.body.hasOwnProperty("team") && await this.teamService.joinTeam(requestUser.id, req.body.team)) {
      res.send("Joined team successfully.");
      return;
    }
    return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to join team."));
  };

  /**
   * Creates JSON representation of all the teams and users in the team
   */
  public getAllTeams = async (req: Request, res: Response, next: Function): Promise<void> => {
    const allUserTeams: User[] = await this.userService.getAllUsersInTeams();

    const teams: Map<string, Object[]> = new Map<string, Object[]>();

    allUserTeams.forEach((user: User) => {
      if (!teams.has(user.team.teamCode))
        teams.set(user.team.teamCode, []);

      teams.get(user.team.teamCode).push({
        "name": user.name,
        "email": user.email
      });
    });

    const teamArray = {};
    teams.forEach((v: Object[], k: string) => {
      teamArray[k] = v;
    });

    res.send(teamArray);
  };

  /**
   * Creates JSON format of the currently logged in users team
   */
  public getTeam = async (req: Request, res: Response, next: Function): Promise<void> => {
    const requestUser: User = req.user as User;
    if (!requestUser.team)  return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

    const userTeam: User[] = await this.userService.getUsersTeamMembers(String(requestUser.team));

    const team: Array<Object> = [];
    userTeam.forEach((user: User) => {
      team.push({
        "name": user.name,
        "email": user.email
      });
    });

    res.send(team);
  };

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