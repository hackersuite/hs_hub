import { HardwareItem, ReservedHardwareItem, User } from "../../db/entity";
import { Repository } from "typeorm";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";
import { LoggerLevels, QueryLogger } from "../../util/logging";
import { HardwareObject } from "./hardwareObjectOptions";
import { ReservedHardwareService } from ".";
import { createToken } from "../../util/crypto";
import { TYPES } from "../../types";
import { inject, injectable } from "inversify";
import { HardwareRepository } from "../../repositories";

export interface HardwareServiceInterface {
  reserveItem: (user: User, itemToReserve: string, requestedQuantity?: number) => Promise<string>;
  getHardwareItemByID: (hardwareItemID: number) => Promise<HardwareItem>;
  reserveItemQuery: (user: User, hardwareItem: HardwareItem, requestedQuantity: number) => Promise<string>;
  isItemReservable: (user: User, hardwareItem: HardwareItem, requestedQuantity: number) => Promise<boolean>;
  takeItem: (token: string) => Promise<boolean>;
  returnItem: (token: string) => Promise<boolean>;
  itemToBeTakenFromLibrary: (userID: string, hardwareItemID: number, itemQuantity: number) => Promise<void>;
  itemToBeReturnedToLibrary: (userID: string, hardwareItemID: number, token: string, itemQuantity: number) => Promise<void>;
  getAllHardwareItemsWithReservations: () => Promise<HardwareItem[]>;
  getAllHardwareItems: () => Promise<HardwareItem[]>;
  addAllHardwareItems: (items: HardwareObject[]) => Promise<void>;
  deleteHardwareItem: (id: number) => Promise<void>;
  updateHardwareItem: (itemToUpdate: HardwareItem) => Promise<void>
}

@injectable()
export class HardwareService implements HardwareServiceInterface {
  private hardwareRepository: Repository<HardwareItem>;
  private reservedHardwareService: ReservedHardwareService;

  constructor(
    @inject(TYPES.HardwareRepository) _hardwareRepository: HardwareRepository,
    @inject(TYPES.ReservedHardwareService) _reservedHardwareService: ReservedHardwareService
  ) {
    this.hardwareRepository = _hardwareRepository.getRepository();
    this.reservedHardwareService = _reservedHardwareService;
  }

  /**
   * Finds the item by name and tries to reserve the item for the user
   * @param itemToReserve - the id of the item to reserve
   * @return A string of the reservation token if successful, `undefined` otherwise
   */
  public reserveItem = async (user: User, itemToReserve: string, requestedQuantity?: number): Promise<string> => {
    if (!requestedQuantity) requestedQuantity = 1;
    const hardwareItem: HardwareItem = await this.getHardwareItemByID(Number(itemToReserve));
    if (await this.isItemReservable(user, hardwareItem, requestedQuantity)) {
      return await this.reserveItemQuery(user, hardwareItem, requestedQuantity);
    }
    return undefined;
  };

  public getHardwareItemByID = async (hardwareItemID: number): Promise<HardwareItem> => {
    try {
      const item: HardwareItem = await this.hardwareRepository
        .findOne({ where: {
            id: hardwareItemID
          }
        });
      return item;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Reserves the item, adding the reservation to the database
   * @param user
   * @param hardwareItem
   */
  public reserveItemQuery = async (user: User, hardwareItem: HardwareItem, requestedQuantity: number): Promise<string> => {
    try {
      // Create the new item reservation object
      const newItemReservation: ReservedHardwareItem = new ReservedHardwareItem();
      newItemReservation.user = user;
      newItemReservation.hardwareItem = hardwareItem;
      newItemReservation.reservationToken = createToken();
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
  public isItemReservable = async (user: User, hardwareItem: HardwareItem, requestedQuantity: number): Promise<boolean> => {
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
  public takeItem = async (token: string): Promise<boolean> => {
    const reservation: ReservedHardwareItem = await this.reservedHardwareService.getReservationFromToken(token);
    if (!reservation) return undefined;

    const userID: string = reservation.user.id,
      itemID: number = reservation.hardwareItem.id,
      isReserved: boolean = reservation.isReserved,
      itemQuantity: number = reservation.reservationQuantity;

    if (isReserved) {
      // Checks that reservation is not expired
      if (!this.reservedHardwareService.isReservationValid(reservation.reservationExpiry)) {
        // Remove the reservation from the database
        await this.reservedHardwareService.deleteReservation(token);
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "Item reservation has expired");
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
  public returnItem = async (token: string): Promise<boolean> => {
    const reservation: ReservedHardwareItem = await this.reservedHardwareService.getReservationFromToken(token);
    if (!reservation) return false;

    const userID: string = reservation.user.id,
      itemID: number = reservation.hardwareItem.id,
      isReserved: boolean = reservation.isReserved,
      itemQuantity: number = reservation.reservationQuantity;

    if (!isReserved) {
      await this.itemToBeReturnedToLibrary(userID, itemID, token, itemQuantity);
    } else {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "This has not been taken yet");
    }

    return true;
  };

  public itemToBeTakenFromLibrary = async (userID: string, hardwareItemID: number, itemQuantity: number): Promise<void> => {
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
  public itemToBeReturnedToLibrary = async (userID: string, hardwareItemID: number, token: string, itemQuantity: number): Promise<void> => {
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
  public getAllHardwareItemsWithReservations = async (): Promise<HardwareItem[]> => {
    const items: HardwareItem[] = await this.hardwareRepository
      .createQueryBuilder("hardwareItem")
      .leftJoinAndSelect("hardwareItem.reservations", "reservations")
      .leftJoinAndSelect("reservations.user", "user")
      .orderBy("hardwareItem.name")
      .getMany();

    return items;
  };

  /**
   * Returns all the hardware items from the database
   */
  public getAllHardwareItems = async (): Promise<HardwareItem[]> => {
    const hardwareItems: HardwareItem[] = await this.hardwareRepository
      .find({
        order: {
          name: "ASC"
        }
      });
    return hardwareItems;
  };

  /**
   * Adds new hardware items to the database
   *
   * @param items
   */
  public addAllHardwareItems = async (items: HardwareObject[]): Promise<void> => {
    const hardwareItems: Array<HardwareItem> = new Array<HardwareItem>();

    items.forEach((item: HardwareObject) => {
      const newHardwareItem = new HardwareItem();
      newHardwareItem.name = item.name;
      newHardwareItem.itemURL = item.itemURL;
      newHardwareItem.totalStock = item.totalStock;
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
  public deleteHardwareItem = async(id: number): Promise<void> => {
    const itemId = id;
    const item: HardwareItem = await this.hardwareRepository.findOne(itemId);

    if (!item) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Could not find an item with the given id!");
    }
    if (item.reservedStock > 0 || item.takenStock > 0) {
      throw new ApiError(HttpResponseCode.BAD_REQUEST, "Cannot delete an item that has reservations!");
    }
    await this.hardwareRepository.delete(itemId);
  };

  public updateHardwareItem = async (itemToUpdate: HardwareItem): Promise<void> => {
    try {
      await this.hardwareRepository.save(itemToUpdate);
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };
}