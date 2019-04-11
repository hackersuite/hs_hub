import { Repository, EntityManager, DeleteResult } from "typeorm";
import { ReservedHardwareItem, HardwareItem } from "../../db/entity/hub";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";

export class ReservedHardwareService {
  private reservedHardwareRepository: Repository<ReservedHardwareItem>;

  constructor(_reservedHardwareRepository: Repository<ReservedHardwareItem>) {
    this.reservedHardwareRepository = _reservedHardwareRepository;
  }

  getAllReservations = async (): Promise<ReservedHardwareItem[]> => {
    try {
      const reservations: ReservedHardwareItem[] = await this.reservedHardwareRepository
        .createQueryBuilder("reservation")
        .addSelect("user.id")
        .innerJoinAndSelect("reservation.hardwareItem", "item")
        .innerJoinAndSelect("reservation.user", "user")
        .getMany();

      return reservations;
    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  getReservation = async (token: string): Promise<ReservedHardwareItem> => {
    try {
      const reservation: ReservedHardwareItem = await this.reservedHardwareRepository
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

  /**
   * Cancel reservation is the most involved:
   *
   *  - It finds the reservation entity from the token
   *
   *  - Checks the reservation exists and tries to cancel the user reservation
   * @param token The token of the reservation
   * @param userId The user id of the user performing the cancellation
   */
  cancelReservation = async (token: string, userId: number): Promise<void> => {
    const reservation: ReservedHardwareItem = await this.reservedHardwareRepository
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
    await this.reservedHardwareRepository.manager.transaction(async transaction => {
      const response: DeleteResult = await this.removeReservation(token, transaction);

      if (response.raw.affectedRows != 1) {
        await transaction.save(reservation);
        throw new ApiError(HttpResponseCode.INTERNAL_ERROR, "Could not cancel reservation, please inform us that this error occured.");
      } else {
        await transaction
          .getRepository(HardwareItem)
          .decrement({ id: reservation.hardwareItem.id }, "reservedStock", reservation.reservationQuantity);
      }
    });
  };

  /**
   * Delete reservation is used to remove the reservation entry from the database, and decrement the number of the item reserved
   */
  deleteReservation = async (tokenToDelete: string): Promise<void> => {
    try {
      await this.reservedHardwareRepository.manager.transaction(async transaction => {
        const reservation: ReservedHardwareItem = await this.getReservationFromToken(tokenToDelete, transaction);
        const itemID: number = reservation.hardwareItem.id,
          itemQuantity: number = reservation.reservationQuantity;

        await this.removeReservation(tokenToDelete, transaction);

        // Decrement the reservation count for the hardware item
        await transaction
          .getRepository(HardwareItem)
          .decrement({ id: itemID }, "reservedStock", itemQuantity);
      });

    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
  };

  /**
   * Remove reservation is used to just directly remove a reservation entry from the database
   */
  removeReservation = async (tokenToRemove: string, transaction?: EntityManager): Promise<DeleteResult> => {
    return await (transaction ? transaction.getRepository(ReservedHardwareItem) : this.reservedHardwareRepository)
      .createQueryBuilder()
      .delete()
      .from(ReservedHardwareItem)
      .where("reservationToken = :token", { token: tokenToRemove })
      .execute();
  };

  doesReservationExist = async (userID: number, hardwareItemID: number): Promise<boolean> => {
    const numberOfReservations: number = await this.reservedHardwareRepository
      .createQueryBuilder("reservation")
      .innerJoinAndSelect("reservation.hardwareItem", "item")
      .innerJoinAndSelect("reservation.user", "user")
      .where("item.id = :itemId", { itemId: hardwareItemID })
      .andWhere("user.id = :userId", { userId: userID })
      .getCount();
    return numberOfReservations > 0;
  };

  /**
   * Gets the user and hardware item that the reservation token is linked to
   * @param resToken Unique reservation token for the user reserved hardware item
   */
  getReservationFromToken = async (resToken: string, transaction?: EntityManager): Promise<ReservedHardwareItem> => {
    let reservation: ReservedHardwareItem = undefined;
    try {
      reservation = await (transaction ? transaction : this.reservedHardwareRepository.manager)
      .getRepository(ReservedHardwareItem)
      .createQueryBuilder("reservation")
      .innerJoin("reservation.user", "user")
      .innerJoin("reservation.hardwareItem", "item")
      .select(["user.id", "item.id", "reservation.isReserved", "reservation.reservationExpiry", "reservation.reservationQuantity"])
      .where("reservation.reservationToken = :token", { token: resToken })
      .getOne();

    } catch (err) {
      throw new Error(`Lost connection to database (hub)! ${err}`);
    }
    return reservation;
  };
}