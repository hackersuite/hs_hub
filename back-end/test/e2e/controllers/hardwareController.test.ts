import { Express } from "express";
import { buildApp } from "../../../src/app";
import { User, HardwareItem, ReservedHardwareItem } from "../../../src/db/entity/hub";
import { getConnection } from "typeorm";
import * as request from "supertest";
import { HttpResponseCode } from "../../../src/util/errorHandling/httpResponseCode";
import { exec } from "child_process";

let bApp: Express;
let sessionCookie: string;
let userReservationToken: string;

const testAttendeeUser: User = new User();
testAttendeeUser.name = "Billy Tester II";
testAttendeeUser.email = "billyII@testing.com";
testAttendeeUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testAttendeeUser.authLevel = 0;
testAttendeeUser.team = "TheTesters";
testAttendeeUser.repo = "tests2.git";

const piHardwareItem: HardwareItem = new HardwareItem();
piHardwareItem.name = "Pi";
piHardwareItem.description = "The Raspberry Pi is a series of small single-board computers developed in the United Kingdom.";
piHardwareItem.totalStock = 4;
piHardwareItem.reservedStock = 0;
piHardwareItem.takenStock = 0;
piHardwareItem.itemURL = "";

const viveHardwareItem: HardwareItem = new HardwareItem();
viveHardwareItem.name = "Vive";
viveHardwareItem.description = "The HTC Vive is a virtual reality headset developed by HTC and Valve Corporation.";
viveHardwareItem.totalStock = 2;
viveHardwareItem.reservedStock = 0;
viveHardwareItem.takenStock = 0;
viveHardwareItem.itemURL = "";

/**
 * Preparing for the tests
 */
beforeAll((done: jest.DoneCallback): void => {
  buildApp(async (builtApp: Express, err: Error): Promise<void> => {
    if (err) {
      console.error("Could not start server!");
      done();
    } else {
      bApp = builtApp;
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

      // Login to the app as the attendee
      const response = await request(bApp)
        .post("/user/login")
        .send({
          email: testAttendeeUser.email,
          password: "password123"
        });

      sessionCookie = response.header["set-cookie"].pop().split(";")[0];
    }
    done();
  });
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
  });

  /**
   * Test that an item is reserved when a user sends a request
   */
  test("Should check the specified item is reserved by the user", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/hardware/reserve")
      .set("Cookie", sessionCookie)
      .send({
        item: piHardwareItem.name,
        quantity: 1
      });

    expect(response.status).toBe(HttpResponseCode.OK);
    expect(response.body.message).toBe("Item(s) reserved!");
    expect(response.body.token).not.toBeUndefined();
    userReservationToken = response.body.token;
  });

  /**
   * Test that once item is reserved, reservation is added to database
   */
  test("Should check that reservation is added to database", async (): Promise<void> => {
    const reservation: ReservedHardwareItem = await getConnection("hub")
      .getRepository(ReservedHardwareItem)
      .createQueryBuilder("item")
      .where("item.userId = :id", { id: testAttendeeUser.id })
      .andWhere("item.hardwareItemId = :itemID", { itemID: piHardwareItem.id })
      .getOne();
    expect(reservation).not.toBeUndefined();
    expect(reservation.isReserved).toBe(true);
  });

  /**
   * Test that item can be taken and database is updated
   */
  test("Should check that item can be taken and database is updated", async (): Promise<void> => {
    // Make it so the test user has access to take the items from the library for ease of use
    await getConnection("hub")
      .createQueryBuilder()
      .update(User)
      .set({ authLevel: 1 })
      .where("id = :id", { id: testAttendeeUser.id })
      .execute();

    const response = await request(bApp)
      .post("/hardware/take")
      .set("Cookie", sessionCookie)
      .send({
        token: userReservationToken,
    });
    expect(response).not.toBeUndefined();
    expect(response.body.message).toBe("Item has been taken from the library");
  });

  /**
   * Test that item can be returned and database is updated
   */
  test("Should check that item can be returned and database is updated", async (): Promise<void> => {
    const response = await request(bApp)
      .post("/hardware/return")
      .set("Cookie", sessionCookie)
      .send({
        token: userReservationToken,
    });
    expect(response).not.toBeUndefined();
    expect(response.body.message).toBe("Item has been returned to the library");
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

