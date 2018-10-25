import * as passport from "passport";
import { getUserByIDFromHub } from "./userValidation";
import { User } from "../../db/entity/user";

export const createPassportSerialization = (): void => {
  // Passport serialization
  passport.serializeUser((user: User, done: Function): void => {
    done(undefined, user.id);
  });

  // Passport deserialization
  passport.deserializeUser(async (id: number, done: Function): Promise<void> => {
    let user: User = undefined;
    try {
      user = await getUserByIDFromHub(id);
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
