import { Router } from "express";
import * as passport from "passport";

/**
 * A router for handling the sign in of a user
 */
export const userRouter = (): Router => {
  // Initializing the router
  const router = Router();

  /**
   * POST /user/login
   */
  router.post("/login", function (req, res) {
    passport.authenticate("local", function (err, user, info) {
      if (err) { return res.status(401).json(err); }
      if (!user) { return res.status(401).json({ message: info.message }); }
      res.send({ message: user.email });
    })(req, res);
  });
  return router;
};
