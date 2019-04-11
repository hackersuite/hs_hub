import { Repository } from "typeorm";
import { Team, User } from "../../db/entity/hub";
import { UserService } from "../users";

export class TeamService {
  private teamRepository: Repository<Team>;
  private userService: UserService;

  constructor(_teamRepository: Repository<Team>, _userService: UserService) {
    this.teamRepository = _teamRepository;
    this.userService = _userService;
  }

  /**
   * This function performs two different operations depending on the database state
   *
   * - If the given team exists, it adds the user to the team only
   *
   * - If the team does not exist, then the team is created and the user is added
   * @param userID The user to add to the team
   * @param teamCode The new (or existing) team code
   */
  createOrAddTeam = async (userID: number, teamCode: string): Promise<void> => {
    // Try to create a new team, if it exists, then add the user instead
    if (teamCode === undefined) return;
    if (!(await this.createTeam(teamCode))) {
      await this.joinTeam(userID, teamCode);
    }
  };

  /**
   * Creates a new team in the database
   * @param teamCode The new team code to identify the team
   */
  createTeam = async (teamCode: string): Promise<boolean> => {
    if (teamCode === undefined) return false;

    if (!(await this.checkTeamExists(teamCode))) {
      await this.teamRepository
        .save({ teamCode: teamCode });
      return true;
    }
    return false;
  };

  /**
   * Makes a user leave the team and if the user was the last one in the team, then it is deleted
   * @param userID The user to make leave the team
   * @param currentTeam The team code which the user is part of
   */
  leaveTeam = async (userID: number, currentTeam: string): Promise<boolean> => {
    try {
      if (userID === undefined || currentTeam === undefined) return false;

      const teamMembers: number = await this.userService.setUserTeamAndCount(userID, undefined);
      if (teamMembers === 0)
        await this.teamRepository.delete(currentTeam);
      return true;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Makes the user join the team based on the team code
   * @param userID The user to make leave the team
   * @param currentTeam The team code which the user is part of
   */
  joinTeam = async (userID: number, teamCode: string): Promise<boolean> => {
    if (userID === undefined || teamCode === undefined) return false;

    if (await this.checkTeamExists(teamCode)) {
      await this.userService.setUserTeam(userID, teamCode);
      return true;
    }

    return false;
  };

  /**
   * Given a team code, it will update the git repository of the team
   * Will be used for checking the git repo of the team
   * @param teamCode The team code of the team to update
   * @param newTeamRepo The new repo link
   */
  updateTeamRepository = async (teamCode: string, newTeamRepo: string): Promise<boolean> => {
    if (!(await this.checkTeamExists(teamCode)))
      return false;

    try {
      await this.teamRepository.save({teamCode: teamCode, repo: newTeamRepo});
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
  updateTeamTableNumber = async (teamCode: string, newTeamTable: number): Promise<boolean> => {
    if (!(await this.checkTeamExists(teamCode)))
      return false;

    try {
      await this.teamRepository.save({teamCode: teamCode, tableNumber: newTeamTable});
      return true;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Checks that the team exists given a team code
   * @param userTeamCode
   */
  checkTeamExists = async (userTeamCode: string): Promise<boolean> => {
    try {
      const teamCodeValid: boolean = await this.teamRepository
        .createQueryBuilder()
        .where("teamCode = :teamCode", { teamCode: userTeamCode })
        .getCount() > 0;

      return teamCodeValid;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Gets all the users in a given team from the team code
   */
  getUsersTeam = async (teamCode: string): Promise<Team> => {
    try {
      const usersTeam: Team = await this.teamRepository
        .findOne({ teamCode: teamCode });
      return usersTeam;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  getUsersTeamMembers = async (teamCode: string): Promise<User[]> => {
    return this.userService.getUsersTeamMembers(teamCode);
  };

  /**
   * Checks that a users team table is set, this is required since a user cannot reserve hardware unless
   * the team table is set
   */
  checkTeamTableIsSet = async (userID: number): Promise<boolean> => {
    try {
      const user: User = await this.userService.getUserByIDFromHub(userID);
      if (user && user.team) {
        const team: Team = await this.getUsersTeam(user.team);
        return (team && team.tableNumber ? true : false);
      }
      return false;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
  };
}