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
    try {
      const user: User = await getUserByEmailFromHub(email);
      if (user) {
        const match: boolean = await validatePassword(password, user.password);
        if (!match) {
          return done(undefined, false, { message: "Password is incorrect." });
        }
        return done(undefined, user);
      }
    } catch (err) {
      return done(err);
    }
    // Step 2:
    // Otherwise, check the applications platform for the user
    const applicationUser: ApplicationUser = await getUserByEmailFromApplications(email);
    if (applicationUser && applicationUser.email_verified) {
      const validPassword: boolean = validatePassword(password, applicationUser.password);
      if (validPassword) {
        // Step 3:
        // If the user is found, password is correct and the email is verified, move to the hub

        const newHubUser: User = new User();
        newHubUser.id = applicationUser.id;
        newHubUser.name = applicationUser.name;
        newHubUser.email = applicationUser.email;
        newHubUser.password = applicationUser.password;
        newHubUser.repo = "";
        newHubUser.team = "";
        newHubUser.authLevel = {
          "is_organizer": applicationUser.is_organizer,
          "is_volunteer": applicationUser.is_volunteer,
          "is_attendee": !(applicationUser.is_volunteer || applicationUser.is_organizer)
        };
        try {
          insertNewHubUserToDatabase(newHubUser);
          return done(undefined, newHubUser);
        } catch (err) {
          return done(undefined, false, { message: "Failed to add the user to the database." });
        }
      } else {
        return done(undefined, false, { message: "Password is incorrect." });
      }
    }
    // Step 4:
    // If not found on either, refer to applications platform
    return done(undefined, false, { message: "Please create account on applications platform first." });
  });
};