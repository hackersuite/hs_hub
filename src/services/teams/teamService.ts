import { Repository } from "typeorm";
import * as request from "request-promise-native";
import { json } from "body-parser";
import { doesNotReject } from "assert";

import { Team, User } from "../../db/entity/hub";
import { UserService } from "../users";
import { RequestTeam, RequestTeamObject, RequestUser, TeamMembers, NewTeamObject } from "../../types";

export class TeamService {
  private teamRepository: Repository<Team>;
  private userService: UserService;

  constructor(_teamRepository: Repository<Team>, _userService: UserService) {
    this.teamRepository = _teamRepository;
    this.userService = _userService;
  }

  /**
   * Creates a new team in the database
   * @returns Name of team created, which can be used to query the team in auth and join it
   * , undefined otherwise
   */
  public createTeam = async (): Promise<String> => {
    try {
      request.post(`${process.env.HUB_URL}/api/v1/teams`, {
        headers: {
          Authorization: `${request.cookies["Authorization"]}`
        },
        body: request.body.name
      });
      return request.body.name;
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
   * @param teamCode The teamcode for the team which the user is to join
   * @returns true if the team was joined, false otherwise
   */
  public joinTeam = async (userID: number, teamCode: string | Team): Promise<boolean> => {
    if (userID === undefined || teamCode === undefined) return false;

    try {
      request.post(`${process.env.HUB_URL}/api/v1/teams/${teamCode}/join`, {
        headers: {
          Authorization: `${request.cookies["Authorization"]}`
        },
        body: userID
      });
      return true;
    } catch (err) {
      return false;
    }


    // // Get the team object from the team code and ensure type safety
    // let teamToJoin: Team;
    // if (typeof userTeam === "string") {
    //   teamToJoin = await this.getTeam(userTeam);
    // } else if (typeof userTeam === "object") {
    //   teamToJoin = userTeam as Team;
    // }
    // // Perform the request to join the team
    // try {
      // await this.userService.setUserTeam(userID, teamToJoin);
    //   return true;
    // } catch (err) {
    //   return false;
    // }
  };

  // /**
  //  * Given a team code, it will update the git repository of the team
  //  * Will be used for checking the git repo of the team
  //  * @param teamCode The team code of the team to update
  //  * @param newTeamRepo The new repo link
  //  */
  // public updateTeamRepository = async (teamCode: string, newTeamRepo: string): Promise<boolean> => {
  //   const foundTeam: Team = await this.getTeam(teamCode);
  //   if (!foundTeam) return false;

  //   try {
  //     foundTeam.repo = newTeamRepo;
  //     await this.teamRepository.save(foundTeam);
  //     return true;
  //   } catch (err) {
  //     throw new Error(`Lost connection to database (hub)! ${err}`);
  //   }
  // };

  // /**
  //  * Updates the user team table number
  //  * @param teamCode
  //  * @param newTeamTable
  //  */
  // public updateTeamTableNumber = async (teamCode: string, newTeamTable: number): Promise<boolean> => {
  //   const foundTeam: NewTeamObject = await this.getTeam(teamCode);
  //   if (!foundTeam) return false;

  //   try {
  //     foundTeam.tableNumber = newTeamTable;
  //     await this.teamRepository.save(foundTeam);
  //   } catch (err) {
  //     throw new Error(`Lost connection to database (hub)! ${err}`);
  //   }
  //   return true;
  // };

  // /**
  //  * Updates the team name
  //  * @param teamCode
  //  * @param newTeamName
  //  */
  // public updateTeamName = async (teamCode: string, newTeamName: string): Promise<boolean> => {
  //   const foundTeam: Team = await this.getTeam(teamCode);
  //   if (foundTeam === undefined) return false;

  //   if (this.checkTeamExists(teamCode)) {
  //     try {
  //         request
  //     } catch (err) {
  //       return false;
  //     }
  //     return true;
  //   } else return false;

  // };

  /**
   * Checks that the team exists given a team code
   * @param teamCode The team code to check that the team exists
   * @returns true if the team exists, false otherwise
   */
  public checkTeamExists = async (teamCode: string): Promise<boolean> => {
    try {
      const team: NewTeamObject = await this.getTeam(teamCode);
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
  // public getTeam = async (teamCode: string): Promise<Team> => {
  //   try {
  //     let team: Team = await this.teamRepository.findOne(teamCode);
  //     // The given code wasn't found as an id, check if its the team name
  //     if (team === undefined)
  //       team = await this.teamRepository.findOne({ name: teamCode });

  //     return team;
  //   } catch (err) {
  //     throw new Error(`Lost connection to database (hub)! ${err}`);
  //   }
  // };
  public getTeam = async (teamCode: string): Promise<NewTeamObject> => {
    let apiresult: string;
    try {
      apiresult = request.get(`${process.env.HUB_URL}/api/v1/teams`, {
        headers: {
          Authorization: `${request.cookies["Authorization"]}`
        }
      });

    } catch (err) {
      console.log(err);
    }
    if (apiresult) {
      const result: RequestTeamObject = JSON.parse(apiresult);
      const team: RequestTeam = result.teams.filter( team => team.teamID == teamCode)[0];
      // if not any yells about: 'Type 'Promise<RequestUser[]>' is missing the following properties from type 'RequestUser[]': length, pop, push, concat, and 26 more.'
      const teamMembers: any = this.getUsersTeamMembers(teamCode);

      // form new teamObject based on given data, set unknown attributes to undefined
      const returnValue: NewTeamObject = {
        teamID: team.teamID,
        teamName: team.teamName,
        repo: undefined,
        tableNumber: undefined,
        users: teamMembers
      };
      return returnValue;
    } else {
      return undefined;
    }
  };

  /**
   * Gets all the members for a specific team
   */
  public getUsersTeamMembers = async (teamCode: string): Promise<RequestUser[]> => {
    let apiresult: string;
    try {
      apiresult = request.get(`${process.env.HUB_URL}/api/v1/teams/${teamCode}/members`, {
        headers: {
          Authorization: `${request.cookies["Authorization"]}`
        }
      });
    } catch (err) {
      console.log(err);
    }

    if (apiresult) {
      const result: TeamMembers = JSON.parse(apiresult);

      return result.users;
    }
  };

  /**
   * Checks that a users team table is set, this is required since a user cannot reserve hardware unless
   * the team table is set
   */
  public checkTeamTableIsSet = async (teamCode: string): Promise<boolean> => {
    try {
        const team: NewTeamObject = await this.getTeam(teamCode);
      return team && team.tableNumber ? true : false;
  } catch (err) {
    console.log(err);
  }
  };
}