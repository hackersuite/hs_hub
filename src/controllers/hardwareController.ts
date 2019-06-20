import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { HardwareItem, ReservedHardwareItem } from "../db/entity/hub";
import { AuthLevels } from "../util/user";
import { validate, ValidationError } from "class-validator";
import { ReservedHardwareService, HardwareService } from "../services/hardware";
import { TeamService } from "../services/teams/teamService";

/**
 * A controller for handling hardware items
 */
export class HardwareController {
  private hardwareService: HardwareService;
  private reservedHardwareService: ReservedHardwareService;
  private teamService: TeamService;
  constructor(_hardwareService: HardwareService, _reservedHardwareService: ReservedHardwareService, _teamService: TeamService) {
    this.hardwareService = _hardwareService;
    this.reservedHardwareService = _reservedHardwareService;
    this.teamService = _teamService;
  }

  /**
   * Returns the user-facing hardware libary page
   */
  public library = async (req: Request, res: Response, next: NextFunction) => {
    const userID: number = req.user.id;
    // First get all the hardware reservations as the expired reservation are removed in the call
    const allReservations: ReservedHardwareItem[] = await this.reservedHardwareService.getAll();
    // Only then get the hardware items as the reservation count will be correctly updated
    const hardwareItems: HardwareItem[] = await this.hardwareService.getAllHardwareItems();
    const formattedData = [];
    for (const item of hardwareItems) {
      const remainingItemCount: number = item.totalStock - (item.reservedStock + item.takenStock);

      const userReservation: ReservedHardwareItem = allReservations.find((reservation) => reservation.hardwareItem.name === item.name && reservation.user.id === userID);

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
    try {
      const reservations = await this.reservedHardwareService.getAll();
      res.render("pages/hardware/loanControls", { reservations: reservations || [], userIsOrganiser: (req.user.authLevel === AuthLevels.Organizer) });
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
      const items = await this.hardwareService.getAllHardwareItemsWithReservations();
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
        res.status(HttpResponseCode.BAD_REQUEST);
        return res.send({
          error: true,
          message: `Could not create item: ${errors.join(",")}`,
        });
      }
      await this.hardwareService.addAllHardwareItems([newItem]);

      req.session.notification = {
        message: `Item ${newItem.name} created!`,
        type: "success"
      };
      res.send({ message: "Item created" });
    } catch (err) {
      return next(err);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { totalStock, name, itemURL  } = req.body;
      const id = req.params.id;

      const itemToUpdate: HardwareItem = await this.hardwareService.getHardwareItemByID(id);

      if (itemToUpdate === undefined) {
        req.session.notification = {
          message: `Could not update item: item ${id} does not exist!`,
          type: "danger"
        };
        res.status(HttpResponseCode.BAD_REQUEST);
        return res.send({
          error: true,
          message: `Could not update item: item ${id} does not exist!` });
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
        res.status(HttpResponseCode.BAD_REQUEST);
        return res.send({
          error: true,
          message: `Could not create item: ${errors.join(",")}`
        });
      }

      await this.hardwareService.updateHardwareItem(itemToUpdate);

      req.session.notification = {
        message: `Item ${itemToUpdate.name} updated!`,
        type: "success"
      };
      res.send({ message: "Item updated" });
    } catch (err) {
      return next(err);
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
      // First check that the team table number is set
      // Check if the team is undefined, use == instead of === since typeorm returns null for relations that are not defined
      if (req.user.team == undefined || !(await this.teamService.checkTeamTableIsSet(req.user.team.teamCode)))
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "You need to create a team and set your table number in the profile page first."));

      const { item, quantity } = req.body;
      if (isNaN(quantity) || Number(quantity) < 1) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Invalid quantity provided!"));
      }
      const token: string = await this.hardwareService.reserveItem(req.user, item, quantity);
      if (token) {
        res.send({
          "message": `Item${quantity > 1 ? "(s)" : ""} reserved!`,
          "token": token,
          "quantity": quantity || 1
        });
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Item cannot be reserved!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Attempts to take the item from the hardware library
   */
  public take = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const takenItem: boolean  = await this.hardwareService.takeItem(req.body.token);
      if (takenItem !== undefined) {
        res.send({
          message: "Item has been taken from the library"
        });
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Incorrect token provided!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  public return = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const returnedItem: boolean  = await this.hardwareService.returnItem(req.body.token);
      if (returnedItem !== false) {
        res.send({
          message: "Item has been returned to the library"
        });
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Incorrect token provided!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Gets all the items from the database
   */
  public getAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allItems: HardwareItem[] = await this.hardwareService.getAllHardwareItems();
      if (allItems !== undefined) {
        res.send(allItems);
      } else {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST, "Action failed!"));
      }
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
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
      await this.hardwareService.addAllHardwareItems(JSON.parse(req.body.items));
      res.send({"message": "Added all items"});
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };

  /**
   * Gets all reservations
   */
  public getAllReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservations = await this.reservedHardwareService.getAll();
      res.send(reservations);
    } catch (err) {
      return next(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.message));
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
      const reservation = await this.reservedHardwareService.getReservation(req.params.token);
      if (!reservation) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No reservation with given token found!");
      }
      res.send(reservation);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Cancels a reservation
   */
  public cancelReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.body.token) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No reservation token provided!");
      }
      await this.reservedHardwareService.cancelReservation(req.body.token, req.user.id);
      res.send({ message: "Success" });
    } catch (err) {
      return next(err);
    }
  };

  public management = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items: HardwareItem[] = await this.hardwareService.getAllHardwareItemsWithReservations();
      const notification = req.session.notification;
      req.session.notification = undefined;

      res.render("pages/hardware/management", { items, notification });
    } catch (err) {
      return next(err);
    }
  };

  public deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "Please provide the ID of the item to delete!");
      }

      await this.hardwareService.deleteHardwareItem(req.params.id);

      res.send({ message: `Item ${req.params.id} deleted` });
    } catch (err) {
      return next(new ApiError(err.statusCode || HttpResponseCode.INTERNAL_ERROR, err.message));
    }
  };
}