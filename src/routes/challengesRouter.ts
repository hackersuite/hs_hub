import { Router } from "express";
import { checkIsOrganizer } from "../util/user";
import { ChallengesController } from "../controllers";
import { Cache } from "../util/cache";
import { getConnection } from "typeorm";
import { Challenge } from "../db/entity/hub";
import { ChallengeService } from "../services/challenges";

export const challengesRouter = (cache: Cache): Router => {
  const challengeService: ChallengeService = new ChallengeService(
    getConnection("hub").getRepository(Challenge)
  );

  // Initialize router
  const router = Router();
  const challengesController = new ChallengesController(cache, challengeService);

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