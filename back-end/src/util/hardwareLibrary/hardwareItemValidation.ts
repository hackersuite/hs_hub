import { HardwareItem, User, ReservedHardwareItem } from "../../db/entity/hub";
import { createToken, parseToken } from "./hardwareItemToken";
import { getConnection } from "typeorm";
import { ApiError } from "../errorHandling/apiError";
import { HttpResponseCode } from "../errorHandling/httpResponseCode";

/**
 * Finds the item by name and tries to reserve the item for the user
 * @param itemToReserve
 * @return A boolean indicating if the item was successfully reserved
 */
export const reserveItem = async (user: User, itemToReserve: string, requestedQuantity?: number): Promise<string> => {
  if (!requestedQuantity) requestedQuantity = 1;

  const hardwareItem: HardwareItem = await getHardwareItemByName(itemToReserve);
  if (await isItemReservable(user, hardwareItem, requestedQuantity)) {
    return reserveItemQuery(user, hardwareItem, requestedQuantity);
  }
  return undefined;
};

/**
 * Gets the hardware item based on the item name
 * @param itemToReserve the name of the item to reserve
 */
export const getHardwareItemByName = async (itemToReserve: string): Promise<HardwareItem> => {
  try {
    const item: HardwareItem = await getConnection("hub")
      .getRepository(HardwareItem)
      .createQueryBuilder("item")
      .select([
        "item.id",
        "item.name",
        "item.totalStock",
        "item.reservedStock",
        "item.takenStock"
      ])
      .where("item.name = :name", { name: itemToReserve })
      .getOne();
    return item ? item : undefined;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const getHardwareItemByID = async (hardwareItemID: number): Promise<HardwareItem> => {
  try {
    const item: HardwareItem = await getConnection("hub")
      .getRepository(HardwareItem)
      .createQueryBuilder("item")
      .where("item.id = :id", { id: hardwareItemID })
      .getOne();
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
export const reserveItemQuery = async (user: User, hardwareItem: HardwareItem, requestedQuantity: number): Promise<string> => {
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

    // Insert the reservation into the database
    await getConnection("hub")
      .createQueryBuilder()
      .insert()
      .into(ReservedHardwareItem)
      .values(newItemReservation)
      .execute();

    // Increment the reservation count for the hardware item
    await getConnection("hub")
      .getRepository(HardwareItem)
      .increment({ id: hardwareItem.id }, "reservedStock", requestedQuantity);

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
export const isItemReservable = async (user: User, hardwareItem: HardwareItem, requestedQuantity: number): Promise<boolean> => {
  // Check the user has not reserved this item yet
  const hasUserNotReserved: boolean = await getConnection("hub")
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id")
    .innerJoinAndSelect("user.hardwareItems", "item")
    .where("user.id = :id", { id: user.id })
    .andWhere("item.hardwareItemId = :itemID", { itemID: hardwareItem.id })
    .getCount() == 0;

  // Check the requested item still has non reserved stock
  const hasStock: boolean = (hardwareItem.totalStock - (hardwareItem.reservedStock + hardwareItem.takenStock) - requestedQuantity) >= 0;

  if (!hasStock) {
    throw new ApiError(HttpResponseCode.BAD_REQUEST, "Not enough items in stock!");
  }

  return hasStock && hasUserNotReserved;
};

/**
 * Takes an item from the library
 * @param token token of the reservation
 */
export const takeItem = async (token: string): Promise<boolean> => {
  const reservation: ReservedHardwareItem = await parseToken(token);
  console.log(token);
  console.log(reservation);
  if (!reservation) return undefined;

  const userID: number = reservation.user.id,
    itemID: number = reservation.hardwareItem.id,
    isReserved: boolean = reservation.isReserved,
    itemQuantity: number = reservation.reservationQuantity;

  if (isReserved) {
    // Checks that reservation is not expired
    if (!isReservationValid(reservation.reservationExpiry)) {
      // Remove the reservation from the database
      await deleteReservation(token);
      return undefined;
    }

    await itemToBeTakenFromLibrary(userID, itemID, itemQuantity);
  } else {
    throw new ApiError(HttpResponseCode.BAD_REQUEST, "This item is already taken");
  }

  return isReserved;
};

/**
 * Returns an item to the library
 * @param token token of the reservation
 */
export const returnItem = async (token: string): Promise<boolean> => {
  const reservation: ReservedHardwareItem = await parseToken(token);
  if (!reservation) return undefined;

  const userID: number = reservation.user.id,
    itemID: number = reservation.hardwareItem.id,
    isReserved: boolean = reservation.isReserved,
    itemQuantity: number = reservation.reservationQuantity;

  if (!isReserved) {
    await itemToBeReturnedToLibrary(itemID, token, itemQuantity);
  } else {
    throw new ApiError(HttpResponseCode.BAD_REQUEST, "This has not been taken yet");
  }

  return isReserved;
};

/**
 * Helper function to check that the expiry time has not been reached
 * @param expiryDate
 */
const isReservationValid = (expiryDate: Date): boolean => {
  return Date.now() <= expiryDate.getTime();
};

export const itemToBeTakenFromLibrary = async (userID: number, hardwareItemID: number, itemQuantity: number): Promise<void> => {
  // The item is reserved and we mark the item as taken
  try {
    await getConnection("hub")
      .createQueryBuilder()
      .update(ReservedHardwareItem)
      .set({ isReserved: 0 })
      .where("userId = :uid", { uid: userID })
      .andWhere("hardwareItemId = :hid", { hid: hardwareItemID })
      .execute();

    await getConnection("hub")
      .createQueryBuilder()
      .update(HardwareItem)
      .set({
        takenStock: () => `takenStock + ${itemQuantity}`,
        reservedStock: () => `reservedStock - ${itemQuantity}`
      })
      .where("id = :id", { id: hardwareItemID })
      .execute();
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

/**
 * Using the unique token the item is returned to the hardware library
 * @param hardwareItemID
 * @param token
 */
export const itemToBeReturnedToLibrary = async (hardwareItemID: number, token: string, itemQuantity: number): Promise<void> => {
  // The item is being returned
  try {
    // Decrement the reservation count for the hardware item
    await getConnection("hub")
      .getRepository(HardwareItem)
      .decrement({ id: hardwareItemID }, "takenStock", itemQuantity);

    // Delete the user reservation from the database
    await getConnection("hub")
      .createQueryBuilder()
      .delete()
      .from(ReservedHardwareItem)
      .where("reservationToken = :resToken", { resToken: token })
      .execute();

  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

/**
 * Returns all the hardware items from the database in a formatted array
 */
export const getAllHardwareItems = async (userId?: number): Promise<Object[]> => {
  const hardwareItems: HardwareItem[] = await getConnection("hub")
    .getRepository(HardwareItem)
    .createQueryBuilder()
    .getMany();

  const userReservations: ReservedHardwareItem[] = await getConnection("hub")
    .getRepository(ReservedHardwareItem)
    .createQueryBuilder("reservation")
    .leftJoinAndSelect("reservation.hardwareItem", "hardwareItem")
    .where("userId = :userId", { userId })
    .getMany();

  const formattedData = [];
  hardwareItems.forEach((item: HardwareItem) => {
    const remainingItemCount: number = item.totalStock - (item.reservedStock + item.takenStock);
    const reservationForItem = userReservations.find(reservation => reservation.hardwareItem.name === item.name);
    formattedData.push({
      "itemName": item.name,
      "itemDescription": item.description,
      "itemURL": item.itemURL,
      "itemStock": item.totalStock,
      "itemsLeft": remainingItemCount,
      "itemHasStock": remainingItemCount > 0 ? "true" : "false",
      "reserved": reservationForItem ? reservationForItem.isReserved : false,
      "taken": reservationForItem ? !reservationForItem.isReserved : false,
      "reservationQuantity": reservationForItem ? reservationForItem.reservationQuantity : 0,
      "reservationToken": reservationForItem ? reservationForItem.reservationToken : ""
    });
  });
  return formattedData;
};

interface HardwareObject {
  itemName?: string;
  itemURL?: string;
  itemDescription?: string;
  itemStock?: number;
}
/**
 * Adds new hardware items to the database
 *
 * @param items
 */
export const addAllHardwareItems = async (items: HardwareObject[]): Promise<void> => {
  const hardwareItems: Array<HardwareItem> = new Array<HardwareItem>();

  items.forEach((item: HardwareObject) => {
    const newHardwareItem = new HardwareItem();
    newHardwareItem.name = item.itemName;
    newHardwareItem.description = item.itemDescription;
    newHardwareItem.itemURL = item.itemURL;
    newHardwareItem.totalStock = item.itemStock;
    newHardwareItem.reservedStock = 0;
    newHardwareItem.takenStock = 0;

    hardwareItems.push(newHardwareItem);
  });

  try {
    await getConnection("hub")
      .createQueryBuilder()
      .insert()
      .into(HardwareItem)
      .values(hardwareItems)
      .execute();
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const getAllReservations = async (): Promise<ReservedHardwareItem[]> => {
  try {
    const reservations = await getConnection("hub")
      .getRepository(ReservedHardwareItem)
      .createQueryBuilder("reservation")
      .innerJoinAndSelect("reservation.hardwareItem", "item")
      .innerJoinAndSelect("reservation.user", "user")
      .getMany();
    return reservations;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};


export const getReservation = async (token: string): Promise<ReservedHardwareItem> => {
  try {
    const reservation = await getConnection("hub")
      .getRepository(ReservedHardwareItem)
      .createQueryBuilder("reservation")
      .innerJoinAndSelect("reservation.hardwareItem", "item")
      .innerJoinAndSelect("reservation.user", "user")
      .where("reservation.reservationToken = :token", { token })
      .getOne();
    return reservation;
  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};

export const cancelReservation = async (token: string, userId: number): Promise<void> => {
  const reservation = await getConnection("hub")
    .getRepository(ReservedHardwareItem)
    .createQueryBuilder("reservation")
    .innerJoinAndSelect("reservation.hardwareItem", "item")
    .innerJoinAndSelect("reservation.user", "user")
    .where("reservation.reservationToken = :token", { token })
    .andWhere("userId = :userId", { userId })
    .getOne();
  if (!reservation) {
    throw new ApiError(HttpResponseCode.BAD_REQUEST, "Could not find reservation!");
  }
  if (!reservation.isReserved) {
    throw new ApiError(HttpResponseCode.BAD_REQUEST, "This reservation cannot be cancelled!");
  }
  const response = await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(ReservedHardwareItem)
    .where("reservationToken = :token", { token })
    .execute();
  if (response.raw.affectedRows != 1) {
    await getConnection("hub")
      .getRepository(ReservedHardwareItem)
      .save(reservation);
    throw new ApiError(HttpResponseCode.INTERNAL_ERROR, "Could not cancel reservation, please inform us that this error occured.");
  } else {
    reservation.hardwareItem.reservedStock -= reservation.reservationQuantity;
    await getConnection("hub")
      .getRepository(HardwareItem)
      .save(reservation.hardwareItem);
  }
};

export const deleteReservation = async (tokenToDelete: string): Promise<void> => {
  try {
    const reservation: ReservedHardwareItem = await parseToken(tokenToDelete);
    const itemID: number = reservation.hardwareItem.id,
      itemQuantity: number = reservation.reservationQuantity;

    await getConnection("hub")
      .createQueryBuilder()
      .delete()
      .from(ReservedHardwareItem)
      .where("reservationToken = :token", { token: tokenToDelete })
      .execute();

    // Decrement the reservation count for the hardware item
    await getConnection("hub")
      .getRepository(HardwareItem)
      .decrement({ id: itemID }, "reservedStock", itemQuantity);

  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
};