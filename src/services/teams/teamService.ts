import request from 'request-promise-native';
import { Team, RequestTeam, RequestTeamMembers } from '../../util/hs_auth';
import { injectable } from 'inversify';

export interface TeamServiceInterface {
	checkTeamExists: (authToken: string, teamCode: string) => Promise<boolean>;
	getTeam: (authToken: string, teamCode: string) => Promise<Team>;
	getUsersTeamMembers: (authToken: string, teamCode: string) => Promise<RequestTeamMembers>;
	checkTeamTableIsSet: (authToken: string, teamCode: string) => Promise<boolean>;
}

@injectable()
export class TeamService implements TeamServiceInterface {
	/**
   * Checks that the team exists given a team code
   * @param authToken The authentication token for the hs_auth platform
   * @param teamCode The team code to check that the team exists
   * @returns true if the team exists, false otherwise
   */
	public checkTeamExists = async (authToken: string, teamCode: string): Promise<boolean> => {
		try {
			const team: Team = await this.getTeam(authToken, teamCode);
			return Boolean(team);
		} catch (err) {
			throw new Error(`Lost connection to database (hub)! ${(err as Error).message}`);
		}
	};

	/**
   * Gets the team data for a given team code
   * @param authToken The authentication token for the hs_auth platform
   * @param teamCode The unique code for a specific team
   * @returns The Team object if found in the database
   */
	public getTeam = async (authToken: string, teamCode: string): Promise<Team> => {
		const apiResult = await request.get(`${process.env.AUTH_URL ?? ''}/api/v1/teams/${teamCode}`, {
			headers: {
				Authorization: authToken
			}
		});

		const team: RequestTeam = JSON.parse(apiResult).team;

		const teamMembers: any = await this.getUsersTeamMembers(authToken, teamCode);

		// Form new team object
		const returnValue: Team = {
			id: team._id,
			name: team.name,
			creator: team.creator,
			tableNumber: team.table_no,
			users: teamMembers
		};

		return returnValue;
	};

	/**
   * Gets all the members for a specific team
   * @param authToken The authentication token for the hs_auth platform
   * @param teamCode Team code for the team that we want to find
   */
	public getUsersTeamMembers = async (authToken: string, teamCode: string): Promise<RequestTeamMembers> => {
		const apiResult: string = await request.get(`${process.env.AUTH_URL ?? ''}/api/v1/teams/${teamCode}/members`, {
			headers: {
				Authorization: authToken
			}
		});

		return JSON.parse(apiResult).users;
	};

	/**
   * Checks that a users team table is set, this is required since a user cannot reserve hardware unless
   * the team table is set
   * @param authToken The authentication token for the hs_auth platform
   * @param teamCode The team code that we want to check if the table number is set
   */
	public checkTeamTableIsSet = async (authToken: string, teamCode: string): Promise<boolean> => {
		const team: Team = await this.getTeam(authToken, teamCode);
		return Boolean(team.tableNumber);
	};
}
