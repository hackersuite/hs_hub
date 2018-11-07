import { Router } from "express";
import { HardwareController } from "../controllers/hardwareController";
import { checkIsLoggedIn, checkIsVolunteer, checkIsOrganizer } from "../util/user";

export const hardwareRouter = (): Router => {
  const router = Router();

  const hardwareController = new HardwareController();

  /**
   * POST /hardware/reserve
   */
  router.post("/reserve", checkIsLoggedIn, hardwareController.reserve);

  /**
   * POST /hardware/take
   */
  router.post("/take",
  // heckIsVolunteer,
  hardwareController.take);

  /**
   * POST /hardware/addItems
   */
  router.post("/addItems", checkIsOrganizer, hardwareController.addAllItems);

  /**
   * GET /hardware/allItems
   */
  router.get("/allItems", hardwareController.getAllItems);

  /**
   * GET /hardware/reservations
   */
  router.get("/reservations", checkIsVolunteer, hardwareController.getAllReservations);

  return router;
};