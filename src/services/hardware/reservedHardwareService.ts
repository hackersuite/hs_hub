import { Repository, EntityManager, DeleteResult } from "typeorm";
import { ReservedHardwareItem, HardwareItem } from "../../db/entity";
import { ApiError, HttpResponseCode } from "../../util/errorHandling";
import { injectable, inject } from "inversify";
import { ReservedHardwareRepository } from "../../repositories";
import { TYPES } from "../../types";

export interface ReservedHardwareServiceInterface {
  getAll: () => Promise<ReservedHardwareItem[]>
  getReservation: (token: string) => Promise<ReservedHardwareItem>;
  cancelReservation: (token: string, userId: string) => Promise<void>;
  deleteReservation: (tokenToDelete: string, reservation?: ReservedHardwareItem) => Promise<void>;
  removeReservation: (tokenToRemove: string, transaction?: EntityManager) => Promise<DeleteResult>;
  doesReservationExist: (userID: string, hardwareItemID: number) => Promise<boolean>;
  getReservationFromToken: (resToken: string, transaction?: EntityManager) => Promise<ReservedHardwareItem>;
  isReservationValid: (expiryDate: Date) => boolean;
}

@injectable()
export class ReservedHardwareService implements ReservedHardwareServiceInterface {
  private reservedHardwareRepository: Repository<ReservedHardwareItem>;

  constructor(
    @inject(TYPES.ReservedHardwareRepository)_reservedHardwareRepository: ReservedHardwareRepository
  ) {
    this.reservedHardwareRepository = _reservedHardwareRepository.getRepository();
  }

  /**
   * Gets all the user reservations, for all hardware items, that have not expired
   *
   * Gets both taken and reserved items
   */
  public getAll = async (): Promise<ReservedHardwareItem[]> => {
    return await this.getAllReservationsRemoveExpired();
  };

  private getAllReservationsRemoveExpired = async (): Promise<ReservedHardwareItem[]> => {
    let allReservations: ReservedHardwareItem[] = await this.getAllReservations();
    allReservations = await Promise.all(allReservations.map(async reservation => {
      if (reservation.isReserved && !this.isReservationValid(reservation.reservationExpiry)) {
        try {
          await this.deleteReservation(undefined, reservation);
          return Promise.resolve(undefined);
        } catch (err) {
          return Promise.reject("Failed to remove expired reservations");
        }
      }
      return Promise.resolve(reservation);
    }));
    return allReservations.filter((reservation) => reservation !== undefined);
  };

  private getAllReservations = async (): Promise<ReservedHardwareItem[]> => {
    try {
      // Get the reservations for all items and users
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

  public getReservation = async (token: string): Promise<ReservedHardwareItem> => {
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
   * `cancelReservation` is safer to use than `deleteReservation`. Cancelling a reservation will do the following:
   *
   *  - It finds the reservation entity from the token
   *
   *  - Checks the reservation exists and tries to cancel the user reservation
   * @param token The token of the reservation
   * @param userId The user id of the user performing the cancellation
   */
  public cancelReservation = async (token: string, userId: string): Promise<void> => {
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
        // The delete result isn't defined, so manually check the deletion
        const reservationForToken: ReservedHardwareItem = await transaction
          .getRepository(ReservedHardwareItem)
          .createQueryBuilder("reservation")
          .where("reservation.reservationToken = :token", { token })
          .getOne();
        if (reservationForToken)
          throw new ApiError(HttpResponseCode.INTERNAL_ERROR, "Could not cancel reservation, please inform us that this error occured.");
      }
      await transaction
        .getRepository(HardwareItem)
        .decrement({ id: reservation.hardwareItem.id }, "reservedStock", reservation.reservationQuantity);
    });
  };

  /**
   * Delete reservation is used to remove the reservation entry from the database, and decrement the number of the item reserved
   * @param tokenToDelete The token is used to find the item reservation
   * @param reservation If defined, then the reservation object is used instead of the token
   */
  public deleteReservation = async (tokenToDelete: string, reservation?: ReservedHardwareItem): Promise<void> => {
    try {
      await this.reservedHardwareRepository.manager.transaction(async transaction => {
        const itemReservation: ReservedHardwareItem = reservation || await this.getReservationFromToken(tokenToDelete, transaction);
        const itemID: number = itemReservation.hardwareItem.id,
          itemQuantity: number = itemReservation.reservationQuantity;

        await this.removeReservation(itemReservation.reservationToken, transaction);

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
  public removeReservation = async (tokenToRemove: string, transaction?: EntityManager): Promise<DeleteResult> => {
    return await (transaction ? transaction.getRepository(ReservedHardwareItem) : this.reservedHardwareRepository)
      .createQueryBuilder()
      .delete()
      .from(ReservedHardwareItem)
      .where("reservationToken = :token", { token: tokenToRemove })
      .execute();
  };

  public doesReservationExist = async (userID: string, hardwareItemID: number): Promise<boolean> => {
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
  public getReservationFromToken = async (resToken: string, transaction?: EntityManager): Promise<ReservedHardwareItem> => {
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

  /**
   * Helper function to check that the expiry time has not been reached
   * @param expiryDate
   * @returns True if the reservation is valid, false otherwise
   */
  public isReservationValid = (expiryDate: Date): boolean => {
    return Date.now() <= expiryDate.getTime();
  };
}