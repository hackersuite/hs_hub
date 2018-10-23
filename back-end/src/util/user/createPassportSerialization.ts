import * as passport from "passport";
import { getUserByEmailFromHub } from "./userValidation";
import { User } from "../../db/entity/user";

export const createPassportSerialization = (): void => {
  // Passport serialization
  passport.serializeUser((user: User, done: Function): void => {
    done(undefined, user.id);
  });

  // Passport deserialization
  passport.deserializeUser(async (email: string, done: Function): Promise<void> => {
    let user: User = undefined;
    try {
      user = await getUserByEmailFromHub(email);
    } catch (err) {
      done(err);
    }
    if (!user) {
      return done(new Error("User not found"));
    } else {
      done(undefined, user.id);
    }
  });
};
