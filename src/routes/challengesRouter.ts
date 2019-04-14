import { Router } from "express";
import { checkIsOrganizer } from "../util/user";
import { ChallengesController } from "../controllers";
import { Cache } from "../util/cache";

export const challengesRouter = (cache: Cache): Router => {
  // Initialize router
  const router = Router();

  const challengesController = new ChallengesController(cache);

  /**
   * GET /challenges/all
   */
  router.get("/all", challengesController.listChallenges);

  /**
   * POST /challenges/create
   */
  router.post("/create", checkIsOrganizer, challengesController.createChallenge);

  /**
   * PUT /challenges/update
   */
  router.put("/update", checkIsOrganizer, challengesController.updateChallenge);

  /**
   * DELETE /challenges/delete
   */
  router.delete("/delete", checkIsOrganizer, challengesController.deleteChallenge);

  return router;
};