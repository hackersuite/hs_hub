import { Router } from "express";
import * as passport from "passport";

/**
 * A router for handling the sign in of a user
 */
export const LoginRouter = (): Router => {
  // Initializing the router
  const router = Router();

  /**
   * GET /home
   */
  router.get("/home", (req, res): void => {
    console.log("Logged in");
    res.send("Logged in");
  });

  /**
   * POST /login
   */
  router.post("/login", function (req, res) {
    passport.authenticate("local", function (err, user, info) {
      if (err) { return res.status(401).json(err); }
      if (!user) { return res.status(401).json({ message: info.message }); }
      res.status(200).redirect("/home");
    })(req, res);
  });
  return router;
};
