import { Router } from "express";
import * as passport from "passport";

// Importing the controller
import { LoginController } from "../controllers";

/**
 * A router for handling the sign in of a user
 */
export const LoginRouter = (): Router => {
  // Initializing the router
  const router = Router();
  const loginController = new LoginController();

  /**
   * GET /home
   */
  router.get("/home", (req, res): void => {
    res.send({ "message": "login successful" });
  });

  /**
   * GET /login
   */
  router.get("/login", (req, res): void => {
    res.send({ "message": "please login" });
  });

  /**
   * POST /login
   */
  router.post("/login", passport.authenticate("local", { successRedirect: "/home", failureRedirect: "/login" }));

  return router;
};
