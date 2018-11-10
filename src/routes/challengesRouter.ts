import { Router } from "express";
import { checkIsOrganizer } from "../util/user";
import { ChallengesController } from "../controllers";

export const challengesRouter = (): Router => {
  // Initialize router
  const router = Router();

  const challengesController = new ChallengesController();

  /**
   * GET /challenges/all
   */
  router.get("/all", challengesController.listChallenges);

  /**
   * POST /challenges/create
   */
  router.post("/create", checkIsOrganizer,
              challengesController.createChallenge);

  /**
   * PUT /challenges/update
   */
  router.put("/update", checkIsOrganizer, challengesController.updateChallenge);

  /**
   * DELETE /challenges/delete
   */
  router.delete("/delete", checkIsOrganizer,
                challengesController.deleteChallenge);

  return router;
};