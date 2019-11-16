import { Repository } from "typeorm";
import { User } from "../../db/entity";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";
import { injectable, inject } from "inversify";
import { UserRepository } from "../../repositories";
import { TYPES } from "../../types";

export interface UserServiceInterface {
  getAllUsers: () => Promise<User[]>;
  getUserByIDFromHub: (submittedID: string) => Promise<User>;
  getPushIDFromUserID: (userIDs: number[]) => Promise<string[]>;
  addPushIDToUser: (user: User, pushID: string) => Promise<void>;
  insertNewHubUserToDatabase: (hubUser: User) => Promise<User>;
}

@injectable()
export class UserService {
  private userRepository: Repository<User>;

  constructor(@inject(TYPES.UserRepository)_userRepository: UserRepository) {
    this.userRepository = _userRepository.getRepository();
  }

  /**
   * Gets all the users from the database, returns all data
   */
  public getAllUsers = async (): Promise<User[]> => {
    return this.userRepository.find();
  };

  /**
   * Gets the whole user object if it exists based on the user id
   * @param submittedID
   * @return Promise of a user
   */
  public getUserByIDFromHub = async (submittedID: string): Promise<User> => {
    const user: User = await this.userRepository
      .createQueryBuilder("user")
      .where("id = :id", { id: submittedID })
      .getOne();

    if (!user)
      throw new ApiError(HttpResponseCode.BAD_REQUEST, `User does not exist with id ${submittedID}`);
    return user;
  };

    /**
   * Gets the whole user object if it exists based on the user id
   * @param authID
   * @return Promise of a user
   */
  public getUserByAuthIDFromHub = async (authID: string): Promise<User> => {
    const user: User = await this.userRepository
      .createQueryBuilder("user")
      .where("authId = :id", { id: authID })
      .getOne();

    if (!user)
      throw new ApiError(HttpResponseCode.BAD_REQUEST, `User does not exist with auth id ${authID}`);
    return user;
  };

  /**
   * Gets all the push ids of the users that we want to send notifications
   * @param userIDs An array of all users to who the notificaiton will be sent
   */
  public getPushIDFromUserID = async (userIDs: number[]): Promise<string[]> => {
    const allUsers: User[] = await this.userRepository
      .findByIds(userIDs);

    // Users can have multiple push ids since they can login on different devices
    // For every user we want to send the push notifications to, add the push ids to the list
    const pushIds: string[] = [];
    allUsers.forEach((user: User) => {
      if (user.push_id && user.push_id.length > 0) {
        user.push_id.forEach((player_id: string) => {
          pushIds.push(player_id);
        });
      }
    });
    return pushIds;
  };

  public addPushIDToUser = async (user: User, pushID: string): Promise<void> => {
    try {
      if (!user.push_id)
        user.push_id = [pushID];
      else
        user.push_id.push(pushID);

      await this.userRepository.save(user);
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Inserts the new hub user into the database, then check the insert worked
   * @param hubUser the new user to insert into the hub database
   */
  public insertNewHubUserToDatabase = async (hubUser: User): Promise<User> => {
    try {
      // Insert the user to the database
      return await this.userRepository.save(hubUser);
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database! ${err}`);
    }
  };
}