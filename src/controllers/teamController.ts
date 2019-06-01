import * as crypto from "crypto";

import { Request, Response } from "express";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { User } from "../db/entity/hub";
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
   * Adds the user to a team using the team code
   */
  public add = async (req: Request, res: Response, next: Function): Promise<void> => {
    const teamCode: string = req.body.teamcode;

    if (teamCode && await this.teamService.joinTeam(req.user.id, teamCode))
      res.send({"teamcode": req.body.teamcode});
    else
      return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Invalid team code"));
  };

  /**
   * Creates a new team, returning a custom team code
   */
  public create = async (req: Request, res: Response, next: Function): Promise<void> => {
    // Create a cryptographically strong random hex string of length 13
    const newTeamCode: string = crypto.randomBytes(Math.ceil(13 / 2)).toString("hex").slice(0, 13);
    if (await this.teamService.createTeam(newTeamCode)) {
      if (await this.teamService.joinTeam(req.user.id, newTeamCode)) {
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
    if (await this.teamService.leaveTeam(req.user.id, req.user.team)) {
      res.send("Left the team successfully.");
      return;
    }
    return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to leave team."));
  };

  /**
   * Leaves the users current team
   */
  public join = async (req: Request, res: Response, next: Function): Promise<void> => {
    if (await this.teamService.joinTeam(req.user.id, req.body.team)) {
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
      if (!teams.has(user.team))
        teams.set(user.team, []);

      teams.get(user.team).push({
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
    if (!req.user.team)  return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

    const userTeam: User[] = await this.userService.getUsersTeamMembers(req.user.team);

    const team: Array<Object> = [];
    userTeam.forEach((user: User) => {
      team.push({
        "name": user.name,
        "email": user.email
      });
    });

    res.send(team);
  };

  public updateRepo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user.team) return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

    if (await this.teamService.updateTeamRepository(req.user.team, req.body.repo))
      res.send("Updated the teams git repository!");
    else
      return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to update the team repository."));
  };

  public updateTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user.team) return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Team not found"));

    if (await this.teamService.updateTeamTableNumber(req.user.team, req.body.tableNumber))
      res.send("Updated the teams table number!");
    else
      return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Failed to update the team table number."));
  };
}