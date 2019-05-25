import { Router } from "express";
import { getConnection } from "typeorm";
import { TeamController } from "../controllers/teamController";
import { checkIsLoggedIn, checkIsVolunteer } from "../util/user";
import { UserService } from "../services/users";
import { User, Team } from "../db/entity/hub";
import { TeamService } from "../services/teams";

export const teamRouter = (): Router => {
  const userService: UserService = new UserService(
    getConnection("hub").getRepository(User)
  );
  const teamService: TeamService = new TeamService(
    getConnection("hub").getRepository(Team), userService
  );

  const router = Router();

  const teamController = new TeamController(teamService, userService);

  /**
   * POST /team/add
   */
  router.post("/add", checkIsLoggedIn, teamController.add);

  /**
   * POST /team/create
   */
  router.post("/create", checkIsLoggedIn, teamController.create);

  /**
   * POST /team/leave
   */
  router.post("/leave", checkIsLoggedIn, teamController.leave);

  /**
   * POST /team/join
   */
  router.post("/join", checkIsLoggedIn, teamController.join);

  /**
   * GET /team/getAllTeams
   */
  router.get("/getAllTeams", checkIsVolunteer, teamController.getAllTeams);

  /**
   * GET /team/getTeam
   */
  router.get("/getTeam", checkIsLoggedIn, teamController.getTeam);

  /**
   * POST /team/updateRepository
   */
  router.post("/updateRepository", checkIsLoggedIn, teamController.updateRepo);

  /**
   * POST /team/updateTableNumber
   */
  router.post("/updateTableNumber", checkIsLoggedIn, teamController.updateTable);

  return router;
};