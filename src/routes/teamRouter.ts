import { Router } from "express";
import { TeamController } from "../controllers/teamController";
import { checkIsLoggedIn, checkIsVolunteer } from "../util/user";

export const teamRouter = (): Router => {
  const router = Router();

  const teamController = new TeamController();

  /**
   * POST /team/add
   */
  router.post("/add", checkIsLoggedIn, teamController.add);

  /**
   * POST /team/create
   */
  router.post("/create", checkIsLoggedIn, teamController.create);

  /**
   * GET /team/getAllTeams
   */
  router.get("/getAllTeams", checkIsVolunteer, teamController.getAllTeams);

  /**
   * GET /team/getTeam
   */
  router.get("/getTeam", checkIsLoggedIn, teamController.getTeam);

  return router;
};