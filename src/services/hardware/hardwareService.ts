import { HardwareItem, ReservedHardwareItem, User } from "../../db/entity/hub";
import { Repository } from "typeorm";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";
import { LoggerLevels, QueryLogger } from "../../util/logging";
import { HardwareObject } from "./hardwareObjectOptions";
import { ReservedHardwareService } from ".";
import { createToken } from "../../util/crypto";

export class HardwareService {
  private hardwareRepository: Repository<HardwareItem>;
  private reservedHardwareService: ReservedHardwareService;

  constructor(_hardwareRepository: Repository<HardwareItem>, _reservedHardwareService: ReservedHardwareService) {
    this.hardwareRepository = _hardwareRepository;
    this.reservedHardwareService = _reservedHardwareService;
  }

  /**
   * Finds the item by name and tries to reserve the item for the user
   * @param itemToReserve
   * @return A boolean indicating if the item was successfully reserved
   */
  reserveItem = async (user: User, itemToReserve: string, requestedQuantity?: number): Promise<string> => {
    if (!requestedQuantity) requestedQuantity = 1;
    const hardwareItem: HardwareItem = await this.getHardwareItemByID(Number(itemToReserve));
    if (await this.isItemReservable(user, hardwareItem, requestedQuantity)) {
      return this.reserveItemQuery(user, hardwareItem, requestedQuantity);
    }
    return undefined;
  };

  getHardwareItemByID = async (hardwareItemID: number): Promise<HardwareItem> => {
    try {
      const item: HardwareItem = await this.hardwareRepository
        .findOne({ where: {
            id: hardwareItemID
          }
        });
      return item ? item : undefined;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Reserves the item, adding the reservation to the database
   * @param user
   * @param hardwareItem
   */
  reserveItemQuery = async (user: User, hardwareItem: HardwareItem, requestedQuantity: number): Promise<string> => {
    try {
      // Create the new item reservation object
      const newItemReservation: ReservedHardwareItem = new ReservedHardwareItem();
      newItemReservation.user = user;
      newItemReservation.hardwareItem = hardwareItem;
      newItemReservation.reservationToken = createToken(16);
      newItemReservation.isReserved = true;
      newItemReservation.reservationQuantity = requestedQuantity;

      // Sets the reservation expiry to be current time + 30 minutes
      newItemReservation.reservationExpiry = new Date(new Date().getTime() + (1000 * 60 * 30));

      await this.hardwareRepository.manager.transaction(async transaction => {
      // Insert the reservation into the database
      await transaction
        .getRepository(ReservedHardwareItem)
        .save(newItemReservation);

      // Increment the reservation count for the hardware item
      await transaction
        .getRepository(HardwareItem)
        .increment({ id: hardwareItem.id }, "reservedStock", requestedQuantity);
      });

      return newItemReservation.reservationToken;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Checks that the user is able to reserve the item
   * @param user
   * @param hardwareItem
   */
  isItemReservable = async (user: User, hardwareItem: HardwareItem, requestedQuantity: number): Promise<boolean> => {
    // Check the user has not reserved this item yet
    const hasUserReserved: boolean = await this.reservedHardwareService.doesReservationExist(user.id, hardwareItem.id);

    // Check the requested item still has non reserved stock
    const hasStock: boolean = (hardwareItem.totalStock - (hardwareItem.reservedStock + hardwareItem.takenStock) - requestedQuantity) >= 0;

    if (!hasStock) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Not enough items in stock!");
    }
    return hasStock && !hasUserReserved;
  };

  /**
   * Takes an item from the library
   * @param token token of the reservation
   */
  takeItem = async (token: string): Promise<boolean> => {
    const reservation: ReservedHardwareItem = await this.reservedHardwareService.getReservationFromToken(token);
    if (!reservation) return undefined;

    const userID: number = reservation.user.id,
      itemID: number = reservation.hardwareItem.id,
      isReserved: boolean = reservation.isReserved,
      itemQuantity: number = reservation.reservationQuantity;

    if (isReserved) {
      // Checks that reservation is not expired
      if (!this.isReservationValid(reservation.reservationExpiry)) {
        // Remove the reservation from the database
        await this.reservedHardwareService.deleteReservation(token);
        return undefined;
      }

      await this.itemToBeTakenFromLibrary(userID, itemID, itemQuantity);
    } else {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "This item is already taken");
    }

    return isReserved;
  };

  /**
   * Returns an item to the library
   * @param token token of the reservation
   */
  returnItem = async (token: string): Promise<boolean> => {
    const reservation: ReservedHardwareItem = await this.reservedHardwareService.getReservationFromToken(token);
    if (!reservation) return undefined;

    const userID: number = reservation.user.id,
      itemID: number = reservation.hardwareItem.id,
      isReserved: boolean = reservation.isReserved,
      itemQuantity: number = reservation.reservationQuantity;

    if (!isReserved) {
      await this.itemToBeReturnedToLibrary(userID, itemID, token, itemQuantity);
    } else {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "This has not been taken yet");
    }

    return isReserved;
  };

  /**
   * Helper function to check that the expiry time has not been reached
   * @param expiryDate
   */
  isReservationValid = (expiryDate: Date): boolean => {
    return Date.now() <= expiryDate.getTime();
  };

  itemToBeTakenFromLibrary = async (userID: number, hardwareItemID: number, itemQuantity: number): Promise<void> => {
    // The item is reserved and we mark the item as taken
    try {
      await this.hardwareRepository.manager.transaction(async transaction => {
        await transaction
          .createQueryBuilder()
          .update(ReservedHardwareItem)
          .set({ isReserved: false })
          .where("userId = :uid", { uid: userID })
          .andWhere("hardwareItemId = :hid", { hid: hardwareItemID })
          .execute();

        await transaction
          .createQueryBuilder()
          .update(HardwareItem)
          .set({
            takenStock: () => `takenStock + ${itemQuantity}`,
            reservedStock: () => `reservedStock - ${itemQuantity}`
          })
          .where("id = :id", { id: hardwareItemID })
          .execute();

          const message: string = `UID ${userID} took ${itemQuantity} of ${hardwareItemID}`;
          new QueryLogger().hardwareLog(LoggerLevels.LOG, message);
      });
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Using the unique token the item is returned to the hardware library
   * @param hardwareItemID
   * @param token
   */
  itemToBeReturnedToLibrary = async (userID: number, hardwareItemID: number, token: string, itemQuantity: number): Promise<void> => {
    // The item is being returned
    try {
      // Decrement the reservation count for the hardware item
      await this.hardwareRepository
        .decrement({ id: hardwareItemID }, "takenStock", itemQuantity);

      // Delete the user reservation from the database
      await this.reservedHardwareService.removeReservation(token);

      const message: string = `UID ${userID} returned ${itemQuantity} of ${hardwareItemID}`;
      new QueryLogger().hardwareLog(LoggerLevels.LOG, message);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Fetches all hardware items with their reservations
   */
  getAllHardwareItemsWithReservations = async (): Promise<HardwareItem[]> => {
    const items: HardwareItem[] = await this.hardwareRepository
      .createQueryBuilder("hardwareItem")
      .leftJoinAndSelect("hardwareItem.reservations", "reservations")
      .leftJoinAndSelect("reservations.user", "user")
      .orderBy("hardwareItem.name")
      .getMany();

    return items;
  };

  /**
   * Returns all the hardware items from the database in a formatted array
   */
  getAllHardwareItems = async (userId?: number): Promise<Object[]> => {
    const hardwareItems: HardwareItem[] = await this.hardwareRepository
      .find({
        order: {
          name: "ASC"
        }
      });

    const allUserReservations: ReservedHardwareItem[] = await this.reservedHardwareService.getAllReservations();

    const formattedData = [];
    for (const item of hardwareItems) {
      let remainingItemCount: number = item.totalStock - (item.reservedStock + item.takenStock);

      // Check if any reservation for the current item have expired
      const reservationsForItem: ReservedHardwareItem[] = allUserReservations.filter((reservation) => reservation.hardwareItem.name === item.name);
      for (const itemReservation of reservationsForItem) {
        if (itemReservation && itemReservation.isReserved && !this.isReservationValid(itemReservation.reservationExpiry)) {
          remainingItemCount += itemReservation.reservationQuantity;
          await this.reservedHardwareService.deleteReservation(itemReservation.reservationToken);
        }
      }
      const userReservation: ReservedHardwareItem = allUserReservations.find((reservation) => reservation.hardwareItem.name === item.name && reservation.user.id === userId);

      const isUsersReservation: boolean = (userReservation !== undefined && userId && userReservation.user.id === userId)
        ? true : false;

      formattedData.push({
        "itemID": item.id,
        "itemName": item.name,
        "itemURL": item.itemURL,
        "itemStock": item.totalStock,
        "itemsLeft": remainingItemCount,
        "itemHasStock": remainingItemCount > 0 ? "true" : "false",
        "reserved": isUsersReservation ? userReservation.isReserved : false,
        "taken": isUsersReservation ? !userReservation.isReserved : false,
        "reservationQuantity": isUsersReservation ? userReservation.reservationQuantity : 0,
        "reservationToken": isUsersReservation ? userReservation.reservationToken : "",
        "expiresIn": isUsersReservation ? Math.floor((userReservation.reservationExpiry.getTime() - Date.now()) / 60000) : 0
      });
    }
    return formattedData;
  };

  /**
   * Adds new hardware items to the database
   *
   * @param items
   */
  addAllHardwareItems = async (items: HardwareObject[]): Promise<void> => {
    const hardwareItems: Array<HardwareItem> = new Array<HardwareItem>();

    items.forEach((item: HardwareObject) => {
      const newHardwareItem = new HardwareItem();
      newHardwareItem.name = item.itemName;
      newHardwareItem.itemURL = item.itemURL;
      newHardwareItem.totalStock = item.itemStock;
      newHardwareItem.reservedStock = 0;
      newHardwareItem.takenStock = 0;

      hardwareItems.push(newHardwareItem);
    });

    try {
      await this.hardwareRepository.save(hardwareItems);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Deletes an item if it has no reservations
   * @param id The id of the item to delete
   */
  deleteHardwareItem = async(id: number): Promise<void> => {
    const itemId = id;
    const item: HardwareItem = await this.hardwareRepository.findOne(itemId);

    if (!item) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Could not find an item with the given id!");
    }
    if (item.reservedStock != 0 || item.takenStock != 0) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Cannot delete an item that has reservations!");
    }
    await this.hardwareRepository.delete(itemId);
  };

  updateHardwareItem = async (itemToUpdate: HardwareItem): Promise<void> => {
    try {
      await this.hardwareRepository.save(itemToUpdate);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };
}