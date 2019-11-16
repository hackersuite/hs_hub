import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { HardwareItem, ReservedHardwareItem, User } from "../db/entity";
import { AuthLevels } from "../util/user";
import { validate, ValidationError } from "class-validator";
import { ReservedHardwareService, HardwareService } from "../services/hardware";
import { TeamService } from "../services/teams/teamService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { RequestUser } from "../util/hs_auth";

export interface HardwareControllerInterface {
  library: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  loanControls: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  addPage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  addItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  updateItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  reserve: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  take: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  return: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getAllItems: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getAllReservations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getReservation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  cancelReservation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  management: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  deleteItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * A controller for handling hardware items
 */
@injectable()
export class HardwareController implements HardwareControllerInterface {
  private _hardwareService: HardwareService;
  private _reservedHardwareService: ReservedHardwareService;
  private _teamService: TeamService;
  constructor(
    @inject(TYPES.HardwareService) hardwareService: HardwareService, 
    @inject(TYPES.ReservedHardwareService) reservedHardwareService: ReservedHardwareService,
    @inject(TYPES.TeamService) teamService: TeamService
  ) {
    this._hardwareService = hardwareService;
    this._reservedHardwareService = reservedHardwareService;
    this._teamService = teamService;
  }

  /**
   * Returns the user-facing hardware libary page
   */
  public library = async (req: Request, res: Response, next: NextFunction) => {
    const requestUser: RequestUser = req.user as RequestUser;
    const userID: string = requestUser.authId;
    // First get all the hardware reservations as the expired reservation are removed in the call
    const allReservations: ReservedHardwareItem[] = await this._reservedHardwareService.getAll();
    // Only then get the hardware items as the reservation count will be correctly updated
    const hardwareItems: HardwareItem[] = await this._hardwareService.getAllHardwareItems();
    const formattedData = [];
    for (const item of hardwareItems) {
      const remainingItemCount: number = item.totalStock - (item.reservedStock + item.takenStock);

      const userReservation: ReservedHardwareItem = allReservations.find((reservation) => reservation.hardwareItem.name === item.name && reservation.user.authId === userID);

      formattedData.push({
        "itemID": item.id,
        "itemName": item.name,
        "itemURL": item.itemURL,
        "itemStock": item.totalStock,
        "itemsLeft": remainingItemCount,
        "itemHasStock": remainingItemCount > 0,
        "reserved": userReservation ? userReservation.isReserved : false,
        "taken": userReservation ? !userReservation.isReserved : false,
        "reservationQuantity": userReservation ? userReservation.reservationQuantity : 0,
        "reservationToken": userReservation ? userReservation.reservationToken : "",
        "expiresIn": userReservation ? Math.floor((userReservation.reservationExpiry.getTime() - Date.now()) / 60000) : 0
      });
    }
    res.render("pages/hardware/index", { items: formattedData });
  };

  /**
   * Returns the hardware management page for volunteers
   */
  public loanControls = async (req: Request, res: Response, next: NextFunction) => {
    const requestUser: RequestUser = req.user as RequestUser;
    try {
      const reservations = await this._reservedHardwareService.getAll();
      res.render("pages/hardware/loanControls", { reservations: reservations || [], userIsOrganiser: (requestUser.authLevel === AuthLevels.Organizer) });
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Returns the page to add an item
   */
  public addPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: the reservations are unnecessary
      const items = await this._hardwareService.getAllHardwareItemsWithReservations();
      res.render("pages/hardware/add", { item: items[0] });
    } catch (err) {
      return next(err);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { totalStock, name, itemURL  } = req.body;

      const newItem: HardwareItem = new HardwareItem();
      newItem.name = name;
      newItem.itemURL = itemURL;
      newItem.totalStock = Number(totalStock);

      const errors: ValidationError[] = await validate(newItem);

      if (errors.length > 0) {
        req.session.notification = {
          message: `Could not create item: ${errors.join(",")}`,
          type: "danger"
        };
        res.status(HttpResponseCode.BAD_REQUEST).send({
          error: true,
          message: `Could not create item: ${errors.join(",")}`,
        });
        return;
      }
      await this._hardwareService.addAllHardwareItems([newItem]);

      req.session.notification = {
        message: `Item ${newItem.name} created!`,
        type: "success"
      };
      res.send({ message: "Item created" });
    } catch (err) {
      next(err);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestUser: RequestUser = req.user as RequestUser;
      const { totalStock, name, itemURL  } = req.body;
      const id = req.params.id;

      const itemToUpdate: HardwareItem = await this._hardwareService.getHardwareItemByID(id);

      if (itemToUpdate === undefined) {
        req.session.notification = {
          message: `Could not update item: item ${id} does not exist!`,
          type: "danger"
        };
        res.status(HttpResponseCode.BAD_REQUEST).send({
          error: true,
          message: `Could not update item: item ${id} does not exist!`
        });
        return;
      }

      itemToUpdate.name = name;
      itemToUpdate.totalStock = Number(totalStock);
      itemToUpdate.itemURL = itemURL;

      const errors: ValidationError[] = await validate(itemToUpdate);

      if (errors.length > 0) {
        req.session.notification = {
          message: `Could not create item: ${errors.join(",")}`,
          type: "danger"
        };
        res.status(HttpResponseCode.BAD_REQUEST).send({
          error: true,
          message: `Could not create item: ${errors.join(",")}`
        });
        return;
      }

      await this._hardwareService.updateHardwareItem(itemToUpdate);

      req.session.notification = {
        message: `Item ${itemToUpdate.name} updated!`,
        type: "success"
      };
      res.send({ message: "Item updated" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Reserves a item from the hardware library
   */
  public reserve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check the requested item in req.body.item can be reserved
    // Using the hardware_item and reserved_hardware_item tables get the current reserved and taken
    // if (stock - (reserved + taken) > 0)
    // then the item can be reserved (reserve the item and return success (+ create qr))
    // otherwise, return that the item can't be reserved
    try {
      const reqUser: RequestUser = req.user as RequestUser;
      // First check that the team table number is set
      // Check if the team is undefined, use == instead of === since typeorm returns null for relations that are not defined
      if (reqUser.team == undefined || !(await this._teamService.checkTeamTableIsSet(reqUser.authToken, reqUser.team))) {
        next(new ApiError(HttpResponseCode.BAD_REQUEST, "You need to create a team and set your table number in the profile page first."));
        return;
      }


      const { item, quantity } = req.body;
      if (isNaN(quantity) || Number(quantity) < 1) {
        next(new ApiError(HttpResponseCode.BAD_REQUEST, "Invalid quantity provided!"));
        return;
      }
      const token: string = await this._hardwareService.reserveItem(reqUser.hubUser, item, quantity);
      if (token) {
        res.send({
          "message": `Item${quantity > 1 ? "(s)" : ""} reserved!`,
          "token": token,
          "quantity": quantity || 1
        });
      } else {
        next(new ApiError(HttpResponseCode.BAD_REQUEST, "Item cannot be reserved!"));
        return;
      }
    } catch (err) {
      next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Attempts to take the item from the hardware library
   */
  public take = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const takenItem: boolean  = await this._hardwareService.takeItem(req.body.token);
      if (takenItem !== undefined) {
        res.send({
          message: "Item has been taken from the library"
        });
      } else {
        next(new ApiError(HttpResponseCode.BAD_REQUEST, "Incorrect token provided!"));
      }
    } catch (err) {
      next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  public return = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const returnedItem: boolean  = await this._hardwareService.returnItem(req.body.token);
      if (returnedItem !== false) {
        res.send({
          message: "Item has been returned to the library"
        });
      } else {
        next(new ApiError(HttpResponseCode.BAD_REQUEST, "Incorrect token provided!"));
      }
    } catch (err) {
      next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Gets all the items from the database
   */
  public getAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allItems: HardwareItem[] = await this._hardwareService.getAllHardwareItems();
      if (allItems !== undefined) {
        res.send(allItems);
      } else {
        next(new ApiError(HttpResponseCode.BAD_REQUEST, "Action failed!"));
      }
    } catch (err) {
      next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Adds all the items in the request to the database
   * Use the following format to add the items:
   * [{
   * "itemName": "...",
   * "itemURL": "...",
   * "itemDescription": "...",
   * "itemStock": 0
   * },
   * {
   * "itemName": "...",
   * "itemURL": "...",
   * "itemDescription": "...",
   * "itemStock": 0
   * }]
   */
  public addAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this._hardwareService.addAllHardwareItems(JSON.parse(req.body.items));
      res.send({"message": "Added all items"});
    } catch (err) {
      next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Gets all reservations
   */
  public getAllReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservations = await this._reservedHardwareService.getAll();
      res.send(reservations);
    } catch (err) {
      next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Gets a reservation
   */
  public getReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.token) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No reservation token provided!");
      }
      const reservation = await this._reservedHardwareService.getReservation(req.params.token);
      if (!reservation) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No reservation with given token found!");
      }
      res.send(reservation);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Cancels a reservation
   */
  public cancelReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const reqUser: RequestUser = req.user as RequestUser;
    try {
      if (!req.body.token) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No reservation token provided!");
      }
      await this._reservedHardwareService.cancelReservation(req.body.token, reqUser.hubUser.id);
      res.send({ message: "Success" });
    } catch (err) {
      next(err);
    }
  };

  public management = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items: HardwareItem[] = await this._hardwareService.getAllHardwareItemsWithReservations();
      const notification = req.session.notification;
      req.session.notification = undefined;

      res.render("pages/hardware/management", { items, notification });
    } catch (err) {
      next(err);
    }
  };

  public deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "Please provide the ID of the item to delete!");
      }

      await this._hardwareService.deleteHardwareItem(Number(req.params.id));

      res.send({ message: `Item ${req.params.id} deleted` });
    } catch (err) {
      next(new ApiError(err.statusCode || HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };
}