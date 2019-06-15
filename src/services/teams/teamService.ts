import { Repository } from "typeorm";
import { Team, User } from "../../db/entity/hub";
import { UserService } from "../users";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";

export class TeamService {
  private teamRepository: Repository<Team>;
  private userService: UserService;

  constructor(_teamRepository: Repository<Team>, _userService: UserService) {
    this.teamRepository = _teamRepository;
    this.userService = _userService;
  }

  /**
   * Creates a new team in the database
   * @returns Team defined if the team was created, undefined otherwise
   */
  public createTeam = async (): Promise<Team> => {
    const newTeam: Team = new Team();
    try {
      await this.teamRepository.save(newTeam);
      return newTeam;
    } catch (err) {
      throw new Error(`Failed to create the team, ${err}`);
    }
  };

  /**
   * Makes a user leave the team and if the user was the last one in the team, then it is deleted
   * @param userID The user to make leave the team
   * @param currentTeam The team which the user is part of
   */
  public leaveTeam = async (userID: number, currentTeam: Team): Promise<boolean> => {
    try {
      if (userID === undefined || currentTeam === undefined) return false;

      const teamMembers: number = await this.userService
        .setUserTeamAndCount(userID, currentTeam, undefined);
      if (teamMembers === 0) {
        await this.teamRepository.delete(currentTeam);
      }
      return true;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Makes the user join the team based on the team code
   * @param userID The user to make leave the team
   * @param userTeam The team which the user is to join
   * @returns true if the team was joined, false otherwise
   */
  public joinTeam = async (userID: number, userTeam: string | Team): Promise<boolean> => {
    if (userID === undefined || userTeam === undefined) return false;

    // Get the team object from the team code and ensure type safety
    let teamToJoin: Team;
    if (typeof userTeam === "string") {
      teamToJoin = await this.getTeam(userTeam);
    } else if (typeof userTeam === "object") {
      teamToJoin = userTeam as Team;
    }
    // Perform the request to join the team
    try {
      await this.userService.setUserTeam(userID, teamToJoin);
      return true;
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, "Failed to update the users team");
    }
  };

  /**
   * Given a team code, it will update the git repository of the team
   * Will be used for checking the git repo of the team
   * @param teamCode The team code of the team to update
   * @param newTeamRepo The new repo link
   */
  public updateTeamRepository = async (teamCode: string, newTeamRepo: string): Promise<boolean> => {
    const foundTeam: Team = await this.getTeam(teamCode);
    if (!foundTeam) return false;

    try {
      foundTeam.repo = newTeamRepo;
      await this.teamRepository.save(foundTeam);
      return true;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Updates the user team table number
   * @param teamCode
   * @param newTeamTable
   */
  public updateTeamTableNumber = async (teamCode: string, newTeamTable: number): Promise<boolean> => {
    const foundTeam: Team = await this.getTeam(teamCode);
    if (!foundTeam) return false;

    try {
      foundTeam.tableNumber = newTeamTable;
      await this.teamRepository.save(foundTeam);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
    return true;
  };

  /**
   * Checks that the team exists given a team code
   * @param teamCode The team code to check that the team exists
   * @returns true if the team exists, false otherwise
   */
  public checkTeamExists = async (teamCode: string): Promise<boolean> => {
    try {
      const team: Team = await this.getTeam(teamCode);
      return team ? true : false;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Gets the team data for a given team code
   * @param teamCode The unique code for a specific team
   * @returns The Team object if found in the database, undefined otherwise
   */
  public getTeam = async (teamCode: string): Promise<Team> => {
    try {
      return await this.teamRepository
        .findOne(teamCode);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Gets all the members for a specific team
   */
  public getUsersTeamMembers = async (teamCode: string): Promise<User[]> => {
    return this.userService.getUsersTeamMembers(teamCode);
  };

  /**
   * Checks that a users team table is set, this is required since a user cannot reserve hardware unless
   * the team table is set
   */
  public checkTeamTableIsSet = async (team: string | Team): Promise<boolean> => {
    try {
      if (typeof team === "string") {
        team = await this.getTeam(team);
      }
      return team && team.tableNumber ? true : false;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
  };
}