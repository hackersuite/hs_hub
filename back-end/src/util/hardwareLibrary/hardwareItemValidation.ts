import { HardwareItem, User, ReservedHardwareItem } from "../../db/entity";
import { createToken, parseToken } from "./hardwareItemToken";
import { getConnection } from "typeorm";

/**
 * Finds the item by name and tries to reserve the item for the user
 * @param itemToReserve
 * @return A boolean indicating if the item was successfully reserved
 */
export const reserveItem = async (user: User, itemToReserve: string): Promise<string> => {
  const hardwareItem: HardwareItem = await getHardwareItemByName(itemToReserve);
  if (await isItemReservable(user, hardwareItem)) {
    return reserveItemQuery(user, hardwareItem);
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
export const reserveItemQuery = async (user: User, hardwareItem: HardwareItem): Promise<string> => {
  try {
    // Create the new item reservation object
    const newItemReservation: ReservedHardwareItem = new ReservedHardwareItem();
    newItemReservation.user = user;
    newItemReservation.hardwareItem = hardwareItem;
    newItemReservation.reservationToken = createToken();
    newItemReservation.isReserved = true;

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
    .increment({ id: hardwareItem.id }, "reservedStock", 1);

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
export const isItemReservable = async (user: User, hardwareItem: HardwareItem): Promise<boolean> => {
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
  const hasStock: boolean = hardwareItem.totalStock - (hardwareItem.reservedStock + hardwareItem.takenStock) > 0;

  return hasStock && hasUserNotReserved;
};

/**
 * We have one route for collecting a reservation and returning an item
 * @param token
 */
export const takeItem = async (token: string): Promise<boolean> => {
  const reservation: ReservedHardwareItem = await parseToken(token);
  if (!reservation) return undefined;

  const userID: number = reservation.user.id,
    itemID: number = reservation.hardwareItem.id,
    isReserved: boolean = reservation.isReserved;

  if (isReserved) {
    // Checks that reservation is not expired
    if (!isReservationValid(reservation.reservationExpiry)) return undefined;

    await itemToBeTakenFromLibrary(userID, itemID);
  } else {
    await itemToBeReturnedToLibrary(itemID, token);
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

export const itemToBeTakenFromLibrary = async (userID: number, hardwareItemID: number): Promise<void> => {
    // The item is reserved and we mark the item as taken
    try {
      await getConnection("hub")
      .createQueryBuilder()
      .update(ReservedHardwareItem)
      .set({isReserved: 0})
      .where("userId = :uid", { uid: userID })
      .andWhere("hardwareItemId = :hid", { hid: hardwareItemID })
      .execute();

      await getConnection("hub")
      .createQueryBuilder()
      .update(HardwareItem)
      .set({
        takenStock: () => "takenStock + 1",
        reservedStock: () => "reservedStock - 1"
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
export const itemToBeReturnedToLibrary = async (hardwareItemID: number, token: string): Promise<void> => {
    // The item is being returned
    try {
      // Decrement the reservation count for the hardware item
      await getConnection("hub")
      .getRepository(HardwareItem)
      .decrement({ id: hardwareItemID }, "takenStock", 1);

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
export const getAllHardwareItems = async (): Promise<Object[]> => {
  const hardwareItems: HardwareItem[] = await getConnection("hub")
    .getRepository(HardwareItem)
    .createQueryBuilder()
    .getMany();

  const formattedData = [];
  hardwareItems.forEach((item: HardwareItem) => {
    formattedData.push({
      "itemName": item.name,
      "itemDescription": item.description,
      "itemURL": item.itemURL,
      "itemStock": item.totalStock,
      "itemHasStock": (item.totalStock - (item.reservedStock + item.takenStock) > 0 ? "true" : "false")
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