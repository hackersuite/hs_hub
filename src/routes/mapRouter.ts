import { Router } from "express";
import { checkIsLoggedIn } from "../util/user";
import { RouterInterface } from ".";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { MapController } from "../controllers";

@injectable()
export class MapRouter implements RouterInterface {
  private _mapController: MapController;

  public constructor(
    @inject(TYPES.MapController)
    mapController: MapController
  ) {
    this._mapController = mapController;
  }

  public getPathRoot(): string {
    return "/map";
  }

  public register(): Router {
    const router: Router = Router();

    router.use(checkIsLoggedIn);

    /**
     * GET /map/get
     * Returns all the locations of the hackers
     */
    router.get("/get", this._mapController.getAllLocations);

    return router;
  }
}
