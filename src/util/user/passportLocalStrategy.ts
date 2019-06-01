import * as localstrategy from "passport-local";
import { User } from "../../db/entity/hub";
import passport = require("passport");
import { UserService } from "../../services/users";

// The done function has the parameters (error, user, info)

export const passportLocalStrategy = (userService: UserService): localstrategy.Strategy => {
  // Passport serialization
  passport.serializeUser((user: User, done: Function): void => {
    done(undefined, user.id);
  });

  // Passport deserialization
  passport.deserializeUser(async (id: number, done: Function): Promise<void> => {
    try {
      const user: User = await userService.getUserByIDFromHub(id);
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
      // Check if the hub has the user and attempt validation
      const user: User = await userService.validateUser(email, password);
      return done(undefined, user);
    } catch (err) {
      // If not found on the platform, then refer to applications to create an account
      return done(undefined, false, err);
    }
  });
};