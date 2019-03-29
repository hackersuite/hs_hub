import { getConnection } from "typeorm";
import * as pbkdf2 from "pbkdf2";
import { User } from "../../db/entity/hub";
import { ApplicationUser } from "../../db/entity/applications";
import { ApiError, HttpResponseCode } from "../errorHandling";
import { ApplicationTeam } from "../../db/entity/applications/applicationTeam";

/**
 * We check that the password hash is valid
 * @param submittedPassword password provided by the user
 * @param passwordFromDatabase password we have got from the database
 */
export function validatePassword(submittedPassword: string, passwordFromDatabase: string): boolean {
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
}

/**
 * This function takes validates a user based on the provided email and password.
 * Gets the hashed password and validates the password using pbkdf2
 * @param submittedEmail
 * @param submittedPassword
 * @return true if user password is valid, false otherwise
 */
export async function validateUser(submittedEmail: string, submittedPassword: string): Promise<boolean> {
  const passwordFromDatabase = await getPasswordFromHub(submittedEmail);
  if (passwordFromDatabase) {
    return validatePassword(submittedPassword, passwordFromDatabase);
  }
  return false;
}

/**
 * Gets the password of the user that is linked to the provided email
 * @param submittedEmail email provided by the user, we search for it in the database
 */
async function getPasswordFromHub(submittedEmail: string): Promise<string> {
  // getRepository implicitly gets the connection from the conneciton manager
  // We then create and execute a query to get the hashed password based on the provided email
  try {
    const user: User = await getConnection("hub")
      .getRepository(User)
      .createQueryBuilder("user")
      .select(
        "user.password"
      )
      .where("user.email = :email", { email: submittedEmail })
      .getOne();
    if (user)
      return user.password;
    return undefined;
  } catch (err) {
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
  }
}

/**
 * Gets the whole user object if it exists based on the user id
 * @param submittedID
 * @return Promise of a user
 */
export async function getUserByIDFromHub(submittedID: number): Promise<User> {
  try {
    const user: User = await getConnection("hub")
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id", { id: submittedID })
      .getOne();

    return user;
  } catch (err) {
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
  }
}

/**
 * Gets the whole user object if it exists based on the user email
 * @param submittedEmail
 * @return Promise of a user
 */
export async function getUserByEmailFromHub(submittedEmail: string): Promise<User> {
  try {
    const user: User = await getConnection("hub")
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.email = :email", { email: submittedEmail })
      .getOne();

    return user;
  } catch (err) {
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (hub)! ${err}`);
  }
}

/**
 * Gets the whole application user object if it exists based on the user email
 * @param submittedEmail
 * @return Promise of a application user
 */
export async function getUserByEmailFromApplications(submittedEmail: string): Promise<ApplicationUser> {
  try {
    const applicationUser: ApplicationUser = await getConnection("applications")
      .getRepository(ApplicationUser)
      .createQueryBuilder()
      .where("email = :email", { email: submittedEmail })
      .getOne();
    return applicationUser;
  } catch (err) {
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
  }
}

export async function getTeamCodeByUserIDFromApplications(userID: number): Promise<string> {
  try {
    const team: ApplicationTeam = await getConnection("applications")
      .getRepository(ApplicationTeam)
      .createQueryBuilder("teams_team")
      .where("user_id = :id", { id: userID })
      .getOne();

    return team ? team.team_code : undefined;
  } catch (err) {
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
  }
}

export async function getPushIDFromUserID(userIDs: number[]): Promise<string[]> {
  const allUsers: User[] = await getConnection("hub")
    .getRepository(User)
    .findByIds(userIDs);

  const pushIds: string[] = [];
  allUsers.forEach((user: User) => {
    user.push_id.forEach((player_id: string) => {
      pushIds.push(player_id);
    });
  });

  return pushIds;
}

/**
 * Inserts the new hub user into the database, then check the insert worked
 * @param hubUser the new user to insert into the hub database
 */
export async function insertNewHubUserToDatabase(hubUser: User): Promise<void> {
  try {
    // Insert the user to the database
    await getConnection("hub").manager.save(hubUser);
  } catch (err) {
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, `Lost connection to database (applications)! ${err}`);
  }
}