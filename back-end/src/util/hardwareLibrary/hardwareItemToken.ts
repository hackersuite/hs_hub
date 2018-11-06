import * as crypto from "crypto";
import { ReservedHardwareItem } from "../../db/entity/hub";
import { getConnection } from "typeorm";

/**
 * Generates a random token for the hardware item reservation
 */
export const createToken = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * Gets the user and hardware item that the reservation token is linked to
 * @param resToken Unique reservation token for the user reserved hardware item
 */
export const parseToken = async (resToken: string): Promise<ReservedHardwareItem> => {
  let reservation: ReservedHardwareItem = undefined;
  try {
    reservation = await getConnection("hub")
    .getRepository(ReservedHardwareItem)
    .createQueryBuilder("reservation")
    .innerJoin("reservation.user", "user")
    .innerJoin("reservation.hardwareItem", "item")
    .select(["user.id", "item.id", "reservation.isReserved", "reservation.reservationExpiry"])
    .where("reservation.reservationToken = :token", { token: resToken })
    .getOne();

  } catch (err) {
    throw new Error(`Lost connection to database (hub)! ${err}`);
  }
  return reservation;
};