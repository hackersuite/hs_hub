import { Router } from "express";
import { HomeController } from "../controllers";
import { checkIsLoggedIn, checkIsOrganizer } from "../util/user/authorization";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { RouterInterface } from ".";

@injectable()
export class HomeRouter implements RouterInterface {
  private _homeController: HomeController;

  public constructor(@inject(TYPES.HomeController) homeController: HomeController) {
    this._homeController = homeController;
  }

  public getPathRoot(): string {
    return "/";
  }

  public register(): Router {
    const router: Router = Router();

    router.get("/contacts",
      checkIsLoggedIn,
      this._homeController.contacts);

    router.get("/challenges",
      checkIsLoggedIn,
      this._homeController.challenges);

    router.get("/",
      checkIsLoggedIn,
      this._homeController.dashboard);

    router.get("/fullscreenTimer",
    checkIsLoggedIn,
    checkIsOrganizer,
    this._homeController.fullscreenTimer);

    return router;
  }
};