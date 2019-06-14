import { Express } from "express";
import { buildApp } from "../../../src/app";
import { User, HardwareItem, ReservedHardwareItem, Team } from "../../../src/db/entity/hub";
import { getConnection } from "typeorm";
import * as request from "supertest";
import { HttpResponseCode } from "../../../src/util/errorHandling/httpResponseCode";
import { getTestDatabaseOptions, reloadTestDatabaseConnection, closeTestDatabaseConnection, initEnv } from "../../util/testUtils";
import { AuthLevels } from "../../../src/util/user";

let bApp: Express;
let sessionCookie: string;
let userReservationToken: string;

const testHubTeamCode: string = "qwerty";

const testAttendeeUser: User = new User();
testAttendeeUser.name = "Billy Tester II";
testAttendeeUser.email = "billyII@testing.com";
testAttendeeUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testAttendeeUser.authLevel = AuthLevels.Attendee;
testAttendeeUser.team = testHubTeamCode;

const piHardwareItem: HardwareItem = new HardwareItem();
piHardwareItem.name = "Pi";
piHardwareItem.totalStock = 4;
piHardwareItem.reservedStock = 0;
piHardwareItem.takenStock = 0;
piHardwareItem.itemURL = "";

const viveHardwareItem: HardwareItem = new HardwareItem();
viveHardwareItem.name = "Vive";
viveHardwareItem.totalStock = 2;
viveHardwareItem.reservedStock = 0;
viveHardwareItem.takenStock = 0;
viveHardwareItem.itemURL = "";

const testHubTeam: Team = new Team();
testHubTeam.teamCode = testHubTeamCode;
testHubTeam.tableNumber = 42;

const itemReservation: ReservedHardwareItem = new ReservedHardwareItem();
itemReservation.reservationToken = "token";
itemReservation.isReserved = true;
itemReservation.reservationQuantity = 1;
itemReservation.reservationExpiry = new Date(new Date().getTime() + (10000 * 60));

/**
 * Preparing for the tests
 */
beforeAll(async (done: jest.DoneCallback): Promise<void> => {
  initEnv();
  buildApp(async (builtApp: Express, err: Error): Promise<void> => {
    if (err) {
      throw new Error("Failed to setup test");
    } else {
      bApp = builtApp;
      done();
    }
  }, getTestDatabaseOptions(undefined, "hub"));
});

beforeEach(async (done: jest.DoneCallback): Promise<void> => {
  await reloadTestDatabaseConnection("hub");

  // Setup the data for the test
  await getConnection("hub").getRepository(User).save(testAttendeeUser);
  await getConnection("hub").getRepository(HardwareItem).save(piHardwareItem);
  await getConnection("hub").getRepository(HardwareItem).save(viveHardwareItem);
  await getConnection("hub").getRepository(Team).save(testHubTeam);

  const response = await request(bApp)
    .post("/user/login")
    .send({
      email: testAttendeeUser.email,
      password: "password123"
    });
  sessionCookie = response.header["set-cookie"].pop().split(";")[0];
  done();
});


/**
 * Testing hardware library requests
 */
describe("Hardware controller tests", (): void => {
  /**
   * Test that the take item route is protected
   */
  test("Should check that an attendee cannot access take route", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/hardware/take")
      .set("Cookie", sessionCookie)
      .send({
        token: "58zb1a546e4ad19b97bdcapc6ce",
      });
    expect(response.status).toBe(HttpResponseCode.REDIRECT);
    expect(response.header.location).toBe("/login");
  });

  /**
   * Test that an item is reserved when a user sends a request
   */
  test("Should check the specified item is reserved by the user", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/hardware/reserve")
      .set("Cookie", sessionCookie)
      .send({
        item: piHardwareItem.id,
        quantity: 1
      });

    expect(response.status).toBe(HttpResponseCode.OK);
    expect(response.body.message).toBe("Item(s) reserved!");
    expect(response.body.token).toBeDefined();
    userReservationToken = response.body.token;

    // Test that once item is reserved, reservation is added to database
    const reservation: ReservedHardwareItem = await getConnection("hub")
      .getRepository(ReservedHardwareItem)
      .createQueryBuilder("item")
      .where("item.userId = :id", { id: testAttendeeUser.id })
      .andWhere("item.hardwareItemId = :itemID", { itemID: piHardwareItem.id })
      .getOne();
    expect(reservation).toBeDefined();
    expect(reservation.isReserved).toBe(true);
    expect(reservation.reservationQuantity).toBe(1);

    const updatedHardwareItem: HardwareItem = await getConnection("hub")
      .getRepository(HardwareItem)
      .findOne(piHardwareItem.id);
    expect(updatedHardwareItem.reservedStock).toBe(1);
  });

  /**
   * Test if a user can reserve if not in a team
   */
  test("Should check that reservation is rejected when user not in a team", async (): Promise<void> => {
    // Remove the team from the user
    testAttendeeUser.team = "";
    await getConnection("hub")
      .getRepository(User)
      .save(testAttendeeUser);

    const response = await request(bApp)
    .post("/hardware/reserve")
    .set("Cookie", sessionCookie)
    .send({
      item: viveHardwareItem.id,
      quantity: 1
    });

    expect(response.status).toBe(HttpResponseCode.BAD_REQUEST);
    expect(response.body.message).toBe("You need to create a team and set your table number in the profile page first.");

    testAttendeeUser.team = testHubTeamCode;
    await getConnection("hub")
      .getRepository(User)
      .save(testAttendeeUser);
  });

  /**
   * Test that item can be taken and database is updated
   */
  describe("Take and return item tests", (): void => {
    beforeEach(async (done: jest.DoneCallback): Promise<void> => {
      // Make it so the test user has access to take the items from the library for ease of use
      await getConnection("hub")
        .createQueryBuilder()
        .update(User)
        .set({ authLevel: AuthLevels.Volunteer })
        .where("id = :id", { id: testAttendeeUser.id })
        .execute();
      done();
    });
    test("Should check that item can be taken and database is updated", async (): Promise<void> => {
      // Add the reservation to the database
      const testItemReservation: ReservedHardwareItem = {...itemReservation, user: testAttendeeUser, hardwareItem: piHardwareItem};
      await getConnection("hub")
        .getRepository(ReservedHardwareItem)
        .save(testItemReservation);

      const response = await request(bApp)
        .post("/hardware/take")
        .set("Cookie", sessionCookie)
        .send({
          token: testItemReservation.reservationToken,
        });
      expect(response).toBeDefined();
      expect(response.body.message).toBe("Item has been taken from the library");
    });

    /**
     * Test that item can be returned and database is updated
     */
    test("Should check that item can be returned and database is updated", async (): Promise<void> => {
      // Add the reservation to the database
      const testItemReservation: ReservedHardwareItem = {...itemReservation, user: testAttendeeUser, hardwareItem: piHardwareItem, isReserved: false};
      await getConnection("hub")
        .getRepository(ReservedHardwareItem)
        .save(testItemReservation);

      const response = await request(bApp)
        .post("/hardware/return")
        .set("Cookie", sessionCookie)
        .send({
          token: testItemReservation.reservationToken,
      });
      expect(response).toBeDefined();
      expect(response.body.message).toBe("Item has been returned to the library");
    });
  });
});

/**
 * Cleaning up after the tests
 */
afterAll(async (done: jest.DoneCallback): Promise<void> => {
  await closeTestDatabaseConnection("hub");
  done();
});

