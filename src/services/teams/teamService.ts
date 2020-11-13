import { Team } from '../../util/hs_auth';
import { injectable } from 'inversify';
import * as authClient from '@unicsmcr/hs_auth_client';

export interface TeamServiceInterface {
	checkTeamExists: (authToken: string, teamCode: string) => Promise<boolean>;
	getTeam: (authToken: string, teamCode: string) => Promise<Team>;
	getUsersTeamMembers: (authToken: string, teamCode: string) => Promise<authClient.User[]>;
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
		const team = await authClient.getTeam(authToken, teamCode);
		const teamMembers = await this.getUsersTeamMembers(authToken, teamCode);

		return {
			...team,
			users: teamMembers.map(user => ({
				authId: user.id,
				authLevel: user.authLevel,
				email: user.email,
				name: user.name,
				team: user.team
			}))
		};
	};

	/**
   * Gets all the members for a specific team
   * @param authToken The authentication token for the hs_auth platform
   * @param teamCode Team code for the team that we want to find
   */
	public getUsersTeamMembers = (authToken: string, teamCode: string): Promise<authClient.User[]> => authClient.getTeamMembers(authToken, teamCode);

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
