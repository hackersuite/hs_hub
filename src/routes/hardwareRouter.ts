import { Router } from "express";
import { HardwareController } from "../controllers/hardwareController";
import { checkIsLoggedIn, checkIsVolunteer, checkIsOrganizer } from "../util/user";
import { HardwareService } from "../services/hardware/hardwareService";
import { HardwareItem, ReservedHardwareItem, User } from "../db/entity/hub";
import { getConnection } from "typeorm";

export const hardwareRouter = (): Router => {
  const hardwareService: HardwareService = new HardwareService(
    getConnection("hub"),
    getConnection("hub").getRepository(HardwareItem),
    getConnection("hub").getRepository(ReservedHardwareItem),
    getConnection("hub").getRepository(User));

  const router = Router();
  const hardwareController = new HardwareController(hardwareService);

  /**
   * GET /hardware
   */
  router.get("/", checkIsLoggedIn, hardwareController.library);

  /**
   * POST /hardware
   */
  router.post("/", checkIsOrganizer, hardwareController.addItem);

  /**
   * GET /hardware/loancontrols
   */
  router.get("/loancontrols", checkIsVolunteer, hardwareController.loanControls);

  /**
   * GET /hardware/management
   */
  router.get("/management", checkIsOrganizer, hardwareController.management);

  /**
   * GET /hardware/add
   */
  router.get("/add", checkIsOrganizer, hardwareController.addPage);

  /**
   * POST /hardware/reserve
   */
  router.post("/reserve", checkIsLoggedIn, hardwareController.reserve);

  /**
   * POST /hardware/cancelReservation
   */
  router.post("/cancelReservation", checkIsLoggedIn, hardwareController.cancelReservation);

  /**
   * POST /hardware/take
   */
  router.post("/take", checkIsVolunteer, hardwareController.take);

  /**
   * POST /hardware/return
   */
  router.post("/return", checkIsVolunteer, hardwareController.return);

  /**
   * POST /hardware/addItems
   */
  router.post("/addItems", checkIsOrganizer, hardwareController.addAllItems);

  /**
   * GET /hardware/allItems
   */
  router.get("/allItems", hardwareController.getAllItems);

  /**
   * GET /hardware/reservation
   */
  router.get("/reservation/:token", checkIsVolunteer, hardwareController.getReservation);

  /**
   * GET /hardware/reservations
   */
  router.get("/reservations", checkIsVolunteer, hardwareController.getAllReservations);

  /**
   * PUT /hardware/:id
   */
  router.put("/:id", checkIsOrganizer, hardwareController.updateItem);

  /**
   * DELETE /hardware/:id
   */
  router.delete("/:id", checkIsOrganizer, hardwareController.deleteItem);

  return router;
};
