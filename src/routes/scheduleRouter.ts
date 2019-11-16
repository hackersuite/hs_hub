import { Router } from "express";
import { checkIsOrganizer, checkIsLoggedIn } from "../util/user";
import { ScheduleController } from "../controllers";
import { injectable, inject } from "inversify";
import { RouterInterface } from ".";
import { TYPES } from "../types";

/**
 * A router for handling the schedule
 */
@injectable()
export class ScheduleRouter implements RouterInterface {
  private _scheduleController: ScheduleController;

  public constructor(@inject(TYPES.ScheduleController) scheduleController: ScheduleController) {
    this._scheduleController = scheduleController;
  }

  public getPathRoot(): string {
    return "/schedule";
  }

  public register(): Router {
    const router: Router = Router();

    router.use(checkIsLoggedIn);

    /**
     * POST /schedule/create
     */
    router.post("/create", checkIsOrganizer, this._scheduleController.createEvent);

    /**
     * POST /schedule/delete
     */
    router.delete("/delete", checkIsOrganizer, this._scheduleController.deleteEvent);

    /**
     * POST /schedule/update
     */
    router.put("/update", checkIsOrganizer, this._scheduleController.updateEvent);

    /**
     * GET /schedule/
     */
    router.get("/", this._scheduleController.listEvents);

    return router;
  }
};
