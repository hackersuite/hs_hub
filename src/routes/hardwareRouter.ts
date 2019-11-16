import { Router } from "express";
import { HardwareController } from "../controllers/hardwareController";
import { checkIsLoggedIn, checkIsVolunteer, checkIsOrganizer } from "../util/user";
import { inject, injectable } from "inversify";
import { RouterInterface } from ".";
import { TYPES } from "../types";

@injectable()
export class HardwareRouter implements RouterInterface {
  private _hardwareController: HardwareController;

  public constructor(@inject(TYPES.HardwareController) hardwareController: HardwareController) {
    this._hardwareController = hardwareController;
  }

  public getPathRoot(): string {
    return "/hardware";
  }

  public register(): Router {
    const router: Router = Router();

    router.use(checkIsLoggedIn);

    /**
     * GET /hardware
     */
    router.get("/", this._hardwareController.library);

    /**
     * POST /hardware
     */
    router.post("/", checkIsOrganizer, this._hardwareController.addItem);

    /**
     * GET /hardware/loancontrols
     */
    router.get("/loancontrols", checkIsVolunteer, this._hardwareController.loanControls);

    /**
     * GET /hardware/management
     */
    router.get("/management", checkIsOrganizer, this._hardwareController.management);

    /**
     * GET /hardware/add
     */
    router.get("/add", checkIsOrganizer, this._hardwareController.addPage);

    /**
     * POST /hardware/reserve
     */
    router.post("/reserve", this._hardwareController.reserve);

    /**
     * POST /hardware/cancelReservation
     */
    router.post("/cancelReservation", this._hardwareController.cancelReservation);

    /**
     * POST /hardware/take
     */
    router.post("/take", checkIsVolunteer, this._hardwareController.take);

    /**
     * POST /hardware/return
     */
    router.post("/return", checkIsVolunteer, this._hardwareController.return);

    /**
     * POST /hardware/addItems
     */
    router.post("/addItems", checkIsOrganizer, this._hardwareController.addAllItems);

    /**
     * GET /hardware/allItems
     */
    router.get("/allItems", this._hardwareController.getAllItems);

    /**
     * GET /hardware/reservation
     */
    router.get("/reservation/:token", checkIsVolunteer, this._hardwareController.getReservation);

    /**
     * GET /hardware/reservations
     */
    router.get("/reservations", checkIsVolunteer, this._hardwareController.getAllReservations);

    /**
     * PUT /hardware/:id
     */
    router.put("/:id", checkIsOrganizer, this._hardwareController.updateItem);

    /**
     * DELETE /hardware/:id
     */
    router.delete("/:id", checkIsOrganizer, this._hardwareController.deleteItem);

    return router;
  }
};
