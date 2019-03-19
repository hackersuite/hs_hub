import { Express } from "express";
import { buildApp } from "../../../../src/app";
import { User, HardwareItem, ReservedHardwareItem } from "../../../../src/db/entity/hub";
import { getConnection } from "typeorm";
import { getAllHardwareItemsWithReservations } from "../../../../src/util/hardwareLibrary";

const testAttendeeUser: User = new User();
testAttendeeUser.name = "Billy Tester III";
testAttendeeUser.email = "billyII@testing.com";
testAttendeeUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testAttendeeUser.authLevel = 0;
testAttendeeUser.team = "TheTesters";
testAttendeeUser.repo = "tests2.git";

const piHardwareItem: HardwareItem = new HardwareItem();
piHardwareItem.name = "Pi2";
piHardwareItem.description = "The Raspberry Pi is a series of small single-board computers developed in the United Kingdom.";
piHardwareItem.totalStock = 4;
piHardwareItem.reservedStock = 0;
piHardwareItem.takenStock = 0;
piHardwareItem.itemURL = "";

const viveHardwareItem: HardwareItem = new HardwareItem();
viveHardwareItem.name = "Vive3";
viveHardwareItem.description = "The HTC Vive is a virtual reality headset developed by HTC and Valve Corporation.";
viveHardwareItem.totalStock = 2;
viveHardwareItem.reservedStock = 1;
viveHardwareItem.takenStock = 0;
viveHardwareItem.itemURL = "";

const viveReservation: ReservedHardwareItem = new ReservedHardwareItem();
viveReservation.hardwareItem = viveHardwareItem;
viveReservation.isReserved = true;
viveReservation.user = testAttendeeUser;
viveReservation.reservationToken = "asasas";


/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express, err: Error): Promise<void> => {
    if (err) {
      console.error("Could not start server!");
      done();
    } else {
      // Creating the test users
      testAttendeeUser.id = (await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(testAttendeeUser)
        .execute()).identifiers[0].id;

      // Insert the hardware items into the database
      piHardwareItem.id = (await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(HardwareItem)
        .values(piHardwareItem)
        .execute()).identifiers[0].id;

      viveHardwareItem.id = (await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(HardwareItem)
        .values(viveHardwareItem)
        .execute()).identifiers[0].id;

      await getConnection("hub")
        .createQueryBuilder()
        .insert()
        .into(ReservedHardwareItem)
        .values(viveReservation)
        .execute();
    }
    done();
  });
});

/**
 * Testing hardware library validation
 */
describe("Hardware validation tests", (): void => {
  /**
   * Test that the take item route is protected
   */
  test("Should fetch all items and their reservations", async (): Promise<void> => {

    const items: HardwareItem[] = await getAllHardwareItemsWithReservations();

    expect(items[0]).toEqual(piHardwareItem);
    expect(items[0].reservations.length).toEqual(0);
    expect(items[1]).toEqual(viveHardwareItem);
    expect(items[1].reservations.length).toEqual(1);
    expect(items[1].reservations[0].user).toEqual(testAttendeeUser);
  });
});

/**
 * Cleaning up after the tests
 */
afterAll(async (): Promise<void> => {
  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(ReservedHardwareItem)
    .where("userId = :id1", { id1: testAttendeeUser.id })
    .execute();

  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id1", { id1: testAttendeeUser.id })
    .execute();

  await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(HardwareItem)
    .where("id = :id1", { id1: piHardwareItem.id })
    .orWhere("id = :id2", { id2: viveHardwareItem.id })
    .execute();

  await getConnection("hub").close();
  await getConnection("applications").close();
});

