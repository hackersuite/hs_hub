import { Repository } from "typeorm";
import { User } from "../../db/entity/hub";
import * as pbkdf2 from "pbkdf2";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";
import { ApplicationUser, ApplicationTeam } from "../../db/entity/applications";

export class UserService {
  private userRepository: Repository<User>;

  constructor(_userRepository: Repository<User>) {
    this.userRepository = _userRepository;
  }

  /**
   * We compare the password provided and the password stored in the database
   * @param submittedPassword password provided by the user
   * @param passwordFromDatabase password we have got from the database
   */
  validatePassword = (submittedPassword: string, passwordFromDatabase: string): boolean => {
    // The password from the database comes with some extra information that we need for validation
    // first we extract the required, the password has a format like:
    // <algorithm>$<iterations>$<salt>$<hash>
    const passwordSplit: string[] = passwordFromDatabase.split("$");

    // e.g <algorithm> = pbkdf2_sha512 (we only need the digest)
    const digest: string = passwordSplit[0].split("_")[1];
    const iterations = Number(passwordSplit[1]);
    const salt: string = passwordSplit[2];
    const hashFromDatabase: string = passwordSplit[3];

    // Finally, we check if the provided password was correct based on the hashed password from the database
    const passwordHash: string = pbkdf2.pbkdf2Sync(
      submittedPassword,
      salt,
      iterations,
      Number(process.env.KEY_LENGTH),
      digest
    ).toString("base64");

    return passwordHash === hashFromDatabase;
  };

  /**
   * Gets all the users from the database, returns all data expect the users password
   * which is defined as a hidden column in the entity
   */
  getAllUsers = async (): Promise<User[]> => {
    return this.userRepository.find();
  };

  /**
   * This function takes validates a user based on the provided email and password.
   * Gets the hashed password and validates the password using pbkdf2
   * @param submittedEmail
   * @param submittedPassword
   * @return true if user password is valid, false otherwise
   */
  validateUser = async (submittedEmail: string, submittedPassword: string): Promise<boolean> => {
    // Get the user password from the database, we need to use a query builder
    // since by default we don't get the user password in the query
    const userWithPassword: User = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("email = :email", {email: submittedEmail})
      .getOne();

    if (userWithPassword && userWithPassword.password) {
      return this.validatePassword(submittedPassword, userWithPassword.password);
    } else {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "User with that email could not be found.");
    }
  };

  /**
   * Gets the whole user object if it exists based on the user id
   * @param submittedID
   * @return Promise of a user
   */
  getUserByIDFromHub = async (submittedID: number): Promise<User> => {
    try {
      const user: User = await this.userRepository
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("id = :id", {id: submittedID})
        .getOne();

      if (!user)
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "User does not exist.");
      return user;
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Gets the whole user object if it exists based on the user email
   * @param submittedEmail
   * @return Promise of a user
   */
  getUserByEmailFromHub = async(submittedEmail: string): Promise<User> => {
    try {
      const user: User = await this.userRepository
        .createQueryBuilder("user")
        .addSelect("password")
        .where("user.email = :email", { email: submittedEmail })
        .getOne();

      if (!user)
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "User does not exist.");
      return user;
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Gets all the push ids of the users that we want to send notifications
   * @param userIDs An array of all users to who the notificaiton will be sent
   */
  getPushIDFromUserID = async (userIDs: number[]): Promise<string[]> => {
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

  /**
   * Inserts the new hub user into the database, then check the insert worked
   * @param hubUser the new user to insert into the hub database
   */
  insertNewHubUserToDatabase = async (hubUser: User): Promise<void> => {
    try {
      // Insert the user to the database
      await this.userRepository.save(hubUser);
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
    }
  };

  /**
   * Sets the new user team code for the user and then gets the count of the
   * number of users left in the team
   * @param userID The id of the user to modify
   * @param newTeamCode The new team code for the user
   */
  setUserTeamAndCount = async (userID: number, newTeamCode: string): Promise<number> => {
    try {
      // Updates and sets the team code for the specified user
      await this.userRepository.update(newTeamCode, { id: userID });

      // Finds all the users in the given team and returns the count
      return await this.userRepository
      .findAndCount({ team: newTeamCode })[1];
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
    }
  };

  /**
   * Sets the new user team code for the user
   * @param userID The id of the user to modify
   * @param newTeamCode The new team code for the user
   */
  setUserTeam = async (userID: number, newTeamCode: string): Promise<void> => {
    try {
      // Updates and sets the team code for the specified user
      await this.userRepository.update(newTeamCode, { id: userID });
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
    }
  };

  /**
   * Gets all the users from any team that exists
   */
  getAllUsersInTeams = async (): Promise<User[]> => {
    try {
      return await this.userRepository
      .createQueryBuilder("user")
      .select(["user.name", "user.team"])
      .where("user.team != :empty", { empty: "" })
      .getMany();
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Gets all the members of a specific team
   * @param teamCode The team code to identify the team
   */
  getUsersTeamMembers = async (teamCode: string): Promise<User[]> => {
    try {
      return await this.userRepository
      .createQueryBuilder("user")
      .select(["user.name", "user.team"])
      .where("user.team = :team", { team: teamCode })
      .getMany();
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };
}