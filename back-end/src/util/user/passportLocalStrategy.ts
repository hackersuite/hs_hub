import * as localstrategy from "passport-local";
import { getUserByEmailFromHub, getUserByEmailFromApplications, validatePassword, insertNewHubUserToDatabase, getUserByIDFromHub, getTeamCodeByUserIDFromApplications } from "./userValidation";
import { User } from "../../db/entity/hub";
import { ApplicationUser } from "../../db/entity/applications";
import { AuthLevels } from "./authLevels";
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
      // Check if the hub has the user
      const user: User = await checkIfHubHasUser(email);
      if (user && !validatePassword(password, user.password))
        return done(undefined, false, { message: "Incorrect credentials provided." });
      else if (user)
        return done(undefined, user);

      // Step 2:
      // Otherwise, check the applications platform for the user
      const applicationUser: ApplicationUser = await checkIfApplicationsHasUser(email);

      if (applicationUser && applicationUser.email_verified) {
        // Step 3:
        // If the user is found and email is verified
        if (!validatePassword(password, applicationUser.password)) done(undefined, false, { message: "Incorrect credentials provided." });

        const newHubUser: User = new User();
        newHubUser.id = applicationUser.id;
        newHubUser.name = applicationUser.name;
        newHubUser.email = applicationUser.email;
        newHubUser.password = applicationUser.password;
        newHubUser.repo = "";
        newHubUser.team = applicationUser.teamCode;
        newHubUser.authLevel = getAuthLevel(applicationUser.is_organizer, applicationUser.is_volunteer);

        insertNewHubUserToDatabase(newHubUser);
        return done(undefined, newHubUser);
      }
      // Step 4:
      // If not found on either, refer to applications platform
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

  function getAuthLevel(isOrganizer: boolean, isVolunteer: boolean): number {
    if (isOrganizer) return AuthLevels.Organizer;
    else if (isVolunteer) return AuthLevels.Volunteer;
    else return AuthLevels.Attendee;
  }
};