import * as localstrategy from "passport-local";
import { getUserByEmailFromHub, getUserByEmailFromApplications, validatePassword, insertNewHubUserToDatabase } from "./user/userValidation";
import { User } from "../db/entity/user";
import { ApplicationUser } from "../db/entity/applicationUser";

export const createPassportLocalStrategy = (): localstrategy.Strategy => {
  return new localstrategy.Strategy({
    usernameField: "email",
    passwordField: "password"
  }, async (email: string, password: string, done: Function): Promise<any> => {
    // Step 1:
    // Check if the hub has the user
    const user: User = await checkIfHubHasUser(email);
    if (user && !validatePassword(password, user.password))
      return done(undefined, false, { message: "Password is incorrect." });
    else if (user)
      return done(undefined, user);

    // Step 2:
    // Otherwise, check the applications platform for the user
    const applicationUser: ApplicationUser = await checkIfApplicationsHasUser(email);

    if (applicationUser && applicationUser.email_verified) {
      // Step 3:
      // If the user is found and email is verified
      if (!validatePassword(password, applicationUser.password)) done(undefined, false, { message: "Password is incorrect" });

      const newHubUser: User = new User();
      newHubUser.id = applicationUser.id;
      newHubUser.name = applicationUser.name;
      newHubUser.email = applicationUser.email;
      newHubUser.password = applicationUser.password;
      newHubUser.repo = "";
      newHubUser.team = "";
      newHubUser.authLevel = getAuthLevel(applicationUser.is_organizer, applicationUser.is_volunteer);

      insertNewHubUserToDatabase(newHubUser);
      return done(undefined, newHubUser);
    }
    // Step 4:
    // If not found on either, refer to applications platform
    return done(undefined, false, { message: "Please create an account." });
  });

  async function checkIfHubHasUser(email: string): Promise<User> {
    try {
      const user: User = await getUserByEmailFromHub(email);
      if (user) return user;
    } catch (err) {
      return undefined;
    }
  }

  async function checkIfApplicationsHasUser(email: string): Promise<ApplicationUser> {
    try {
      const applicationUser: ApplicationUser = await getUserByEmailFromApplications(email);
      if (applicationUser) return applicationUser;
    } catch (err) {
      return undefined;
    }
  }

  function getAuthLevel(isOrganizer: boolean, isVolunteer: boolean): number {
    // 1 -> Organizer
    // 2 -> Volunteer
    // 3 -> Attendee
    if (isOrganizer) return 1;
    else if (isVolunteer) return 2;
    else return 3;
  }

};