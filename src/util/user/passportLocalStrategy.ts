import * as localstrategy from "passport-local";
import { getUserByEmailFromHub, getUserByEmailFromApplications, validatePassword, insertNewHubUserToDatabase, getUserByIDFromHub, getTeamCodeByUserIDFromApplications } from "./userValidation";
import { User } from "../../db/entity/hub";
import { ApplicationUser } from "../../db/entity/applications";
import { getAuthLevel } from "./authLevels";
import passport = require("passport");

export const passportLocalStrategy = (): localstrategy.Strategy => {
  // Passport serialization
  passport.serializeUser((user: User, done: Function): void => {
    done(undefined, user.id);
  });

  // Passport deserialization
  passport.deserializeUser(async (id: number, done: Function): Promise<void> => {
    try {
      const user: User = await getUserByIDFromHub(id);
      if (!user) {
        return done(undefined, undefined);
      } else {
        done(undefined, user);
      }
    } catch (err) {
      done(err);
    }
  });

  return new localstrategy.Strategy({
    usernameField: "email",
    passwordField: "password"
  }, async (email: string, password: string, done: Function): Promise<any> => {
    try {
      // Step 1:
      // Check if the hub has the user and attempt validation
      const user: User = await checkIfHubHasUser(email);
      if (user && validatePassword(password, user.password))
        return done(undefined, user);

      // Step 1a:
      // If the hub has the user, but validation failed, sync with the applications db
      // Also, works for when a user is not yet on the system
      const applicationUser: ApplicationUser = await checkIfApplicationsHasUser(email);

      if (applicationUser && applicationUser.email_verified) {
        // Step 1b:
        // If validation failed again, the password is incorrect
        if (!validatePassword(password, applicationUser.password))
          return done(undefined, false, { message: "Incorrect credentials provided." });

        console.log("This step--------------");
        // Step 2:
        // If we have an application user, add it to the local db
        const newHubUser: User = new User();
        newHubUser.id = applicationUser.id;
        newHubUser.name = applicationUser.name;
        newHubUser.email = applicationUser.email;
        newHubUser.password = applicationUser.password;
        newHubUser.authLevel = getAuthLevel(applicationUser.is_organizer, applicationUser.is_volunteer);
        newHubUser.team = applicationUser.teamCode;
        newHubUser.repo = "";

        insertNewHubUserToDatabase(newHubUser);
        return done(undefined, newHubUser);
      }
      // Step 3:
      // If not found on either platform, then refer to applications to create an account
      return done(undefined, false, { message: "Incorrect credentials provided." });
    } catch (err) {
      return done(err);
    }
  });

  async function checkIfHubHasUser(email: string): Promise<User> {
    const user: User = await getUserByEmailFromHub(email);
    if (user) return user;
  }

  async function checkIfApplicationsHasUser(email: string): Promise<ApplicationUser> {
    // Get the application user from the applications platform
    const applicationUser: ApplicationUser = await getUserByEmailFromApplications(email);

    if (applicationUser) {
      // Try to get the team code for the user, if they are in a team
      const userTeamCode: string = await getTeamCodeByUserIDFromApplications(applicationUser.id);
      applicationUser.teamCode = userTeamCode;

      return applicationUser;
    }
  }
};