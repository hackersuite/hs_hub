import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { AuthApi, User } from '@unicsmcr/hs_auth_client';

export interface UserServiceInterface {
	getAllUsers: () => Promise<User[]>;
	getUserWithId: (userId: string) => Promise<User>;
}

@injectable()
export class UserService {
	private readonly _hsAuth: AuthApi;
	private readonly _hsAuthServiceToken: string;

	public constructor(@inject(TYPES.AuthApi) authApi: AuthApi) {
		this._hsAuth = authApi;
		this._hsAuthServiceToken = process.env.HS_AUTH_SERVICE_TOKEN || '';
	}

	/**
   * Gets all the users from the database, returns all data
   */
	public getAllUsers = async (): Promise<User[]> => this._hsAuth.getUsers(this._hsAuthServiceToken);

	/**
   * Gets the whole user object if it exists based on the user id
   */
	public getUserWithId = async (userId: string): Promise<User> => this._hsAuth.getUser(this._hsAuthServiceToken, userId);
}
