import { Router } from "express";
import { checkIsOrganizer, checkIsLoggedIn } from "../util/user";
import { AnnouncementController } from "../controllers";
import { RouterInterface } from ".";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";

@injectable()
export class AnnouncementRouter implements RouterInterface {
  private _announcementController: AnnouncementController;

  public constructor(@inject(TYPES.AnnouncementController) announcementController: AnnouncementController) {
    this._announcementController = announcementController;
  }

  public getPathRoot(): string {
    return "/announcement";
  }

  public register(): Router {
    const router: Router = Router();

    router.use(checkIsLoggedIn);

    /**
     * POST /announcement/
     */
    router.post("/",
      checkIsOrganizer,
      this._announcementController.announce);

    /**
     * POST /announcement/push
     */
    router.post("/push",
      checkIsOrganizer,
      this._announcementController.pushNotification);

    /**
     * POST /announcement/push/register
     */
    router.post("/push/register",
      this._announcementController.pushNotificationRegister);

    return router;
  }
};