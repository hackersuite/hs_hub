import { Router } from "express";
import { UserController } from "../controllers/userController";
import { checkIsLoggedIn } from "../util/user";
import { RouterInterface } from ".";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";

/**
 * A router for handling the user
 */
@injectable()
export class UserRouter implements RouterInterface {
  private _userController: UserController;

  public constructor(@inject(TYPES.UserController) userController: UserController) {
    this._userController = userController;
  }

  public getPathRoot(): string {
    return "/user";
  }

  public register(): Router {
    const router: Router = Router();

    /**
     * GET /user/profile
     */
    router.get("/profile", checkIsLoggedIn, this._userController.profile);

    router.get("/join_discord", checkIsLoggedIn, this._userController.discordJoin);
  
    router.get("/discord_authentication", checkIsLoggedIn, this._userController.discordAuth);

    return router;
  }
};
