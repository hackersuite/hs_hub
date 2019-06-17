import { Repository } from "typeorm";
import { User } from "../../db/entity/hub";
import * as pbkdf2 from "pbkdf2";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";

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
  public validatePassword = (submittedPassword: string, passwordFromDatabase: string, keyLength?: number): boolean => {
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
  public getAllUsers = async (): Promise<User[]> => {
    return this.userRepository.find();
  };

  /**
   * This function takes validates a user based on the provided email and password.
   * Gets the hashed password and validates the password using pbkdf2
   * @param submittedEmail
   * @param submittedPassword
   * @return the user if validated
   * @throws `BAD_REQUEST` if the email or password is invalid
   */
  public validateUser = async (submittedEmail: string, submittedPassword: string): Promise<User> => {
    // Get the user password from the database, we need to use a query builder
    // since by default we don't get the user password in the query
    try {
      const userWithPassword: User = await this.getUserByEmailFromHub(submittedEmail);

      if (userWithPassword && userWithPassword.password) {
        if (this.validatePassword(submittedPassword, userWithPassword.password)) {
          delete userWithPassword.password;
          return userWithPassword;
        }
      }
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Email or password is invalid");
    } catch (err) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Email or password is invalid");
    }
  };

  /**
   * Gets the whole user object if it exists based on the user id
   * @param submittedID
   * @return Promise of a user
   */
  public getUserByIDFromHub = async (submittedID: number): Promise<User> => {
    const user: User = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("id = :id", {id: submittedID})
      .getOne();

    if (!user)
      throw new ApiError(HttpResponseCode.BAD_REQUEST, `User does not exist with id ${submittedID}`);
    return user;
  };

  /**
   * Gets the whole user object if it exists based on the user email
   * @param submittedEmail
   * @return Promise of a user
   */
  public getUserByEmailFromHub = async(submittedEmail: string): Promise<User> => {
    const user: User = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email: submittedEmail })
      .getOne();
    if (!user)
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "User does not exist.");
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
      if (user.pushId && user.pushId.length > 0) {
        user.pushId.forEach((player_id: string) => {
          pushIds.push(player_id);
        });
      }
    });
    return pushIds;
  };

  public addPushIDToUser = async (user: User, pushID: string): Promise<void> => {
    try {
      if (!user.pushId)
        user.pushId = [pushID];
      else
        user.pushId.push(pushID);

      await this.userRepository.save(user);
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Inserts the new hub user into the database, then check the insert worked
   * @param hubUser the new user to insert into the hub database
   */
  public insertNewHubUserToDatabase = async (hubUser: User): Promise<void> => {
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
   * @param currentTeam Current team of the user, used if team is removed
   * @param newTeamCode The new team code for the user
   */
  public setUserTeamAndCount = async (userID: number, currentTeam: string, newTeamCode: string): Promise<number> => {
    try {
      // Updates and sets the team code for the specified user
      await this.userRepository.update(userID, { team: newTeamCode });

      // Finds all the users in the given team and returns the count
      const userAndTeam: [User[], number] = await this.userRepository
      .findAndCount({ team: newTeamCode ? newTeamCode : currentTeam });
      return userAndTeam[1];
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
    }
  };

  /**
   * Sets the new user team code for the user
   * @param userID The id of the user to modify
   * @param newTeamCode The new team code for the user
   */
  public setUserTeam = async (userID: number, newTeamCode: string): Promise<void> => {
    try {
      // Updates and sets the team code for the specified user
      await this.userRepository.save({ id: userID, team: newTeamCode });
    } catch (err) {
      throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
    }
  };

  /**
   * Gets all the users from any team that exists
   */
  public getAllUsersInTeams = async (): Promise<User[]> => {
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
  public getUsersTeamMembers = async (teamCode: string): Promise<User[]> => {
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

  /**
   * Creates a new user. Returns the saved user with its new id or throws an error.
   * @param user the user to be saved
   */
  public create = async (user: User): Promise<User> => {
    try {
      return await this.userRepository.save(user);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  }
}