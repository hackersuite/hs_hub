import { HardwareService, ReservedHardwareService } from "../../../src/services/hardware";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection, initEnv } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { User, AchievementProgress, ReservedHardwareItem, HardwareItem } from "../../../src/db/entity/hub";
import { HttpResponseCode } from "../../../src/util/errorHandling";

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

const testUser: User = new User();
testUser.name = "Billy Tester II";
testUser.email = "billyII@testing-validation.com";
testUser.password = "pbkdf2_sha256$30000$xmAiV8Wihzn5$BBVJrxmsVASkYuOI6XdIZoYLfy386hdMOF8S14WRTi8=";
testUser.authLevel = 1;
testUser.team = "TeamCodeHere-";
testUser.push_id = ["a64a87ad-df62-47c7-9592-85d71291abf2"];

const itemReservation: ReservedHardwareItem = new ReservedHardwareItem();
itemReservation.reservationToken = "token";
itemReservation.isReserved = true;
itemReservation.reservationQuantity = 1;
itemReservation.reservationExpiry = new Date(new Date().getTime() + (10000 * 60));

let hardwareService: HardwareService;
let reservedHardwareService: ReservedHardwareService;

beforeAll(async (done: jest.DoneCallback): Promise<void> => {
  initEnv();

  await createTestDatabaseConnection([ User, AchievementProgress, ReservedHardwareItem, HardwareItem ]);
  reservedHardwareService = new ReservedHardwareService(getRepository(ReservedHardwareItem));
  hardwareService = new HardwareService(getRepository(HardwareItem), reservedHardwareService);

  done();
});

beforeEach(async (done: jest.DoneCallback): Promise<void> => {
  await reloadTestDatabaseConnection();

  done();
});

/**
 * Hardware service tests
 */
describe("Hardware service tests", (): void => {
  /**
   * Test getHardwareItemByID
   */
  describe("getHardwareItemByID tests", (): void => {
    test("Should ensure that a hardware item can be found by ID", async (): Promise<void> => {
      // Test setup
      const hardwareRepository: Repository<HardwareItem> = getRepository(HardwareItem);
      await hardwareRepository.save(piHardwareItem);
      const foundItem: HardwareItem = await hardwareService.getHardwareItemByID(piHardwareItem.id);

      expect(foundItem).toEqual(piHardwareItem);
    });
    test("Should ensure that undefined returned if item is not found", async (): Promise<void> => {
      const foundItem: HardwareItem = await hardwareService.getHardwareItemByID(piHardwareItem.id);
      expect(foundItem).toBeUndefined();
    });
  });

  /**
   * Test reserveItem
   */
  describe("Reserve item tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;
    let userRepository: Repository<User>;
    let reservedHardwareRepository: Repository<ReservedHardwareItem>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
      userRepository = getRepository(User);
      reservedHardwareRepository = getRepository(ReservedHardwareItem);
      await userRepository.save(testUser);
    });

    test("Should ensure that can item can be reserved", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);

      const reservationToken: string = await hardwareService.reserveItem(testUser, String(piHardwareItem.id));
      expect(reservationToken).toBeDefined();

      // Check that the database is updated correctly to reflect reservation
      const reservations: ReservedHardwareItem[] = await reservedHardwareRepository.find();
      expect(reservations.length).toBe(1);
      expect(reservations[0].isReserved).toBeTruthy();

      const updatedItem: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);

      expect(updatedItem.reservedStock).toBe(1);
    });
    test("Should ensure item is not reserved when no stock", async (): Promise<void> => {
      // Test setup
      const testPiItem: HardwareItem = {...piHardwareItem, totalStock: 0, id: piHardwareItem.id + 1, name: "Test"};
      await hardwareRepository.save(testPiItem);

      try {
        await hardwareService.reserveItem(testUser, String(testPiItem.id));
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }
    });
    test("Should ensure undefined returned if user has reservation", async (): Promise<void> => {
      // Test setup
      const testItemReservation: ReservedHardwareItem = {...itemReservation, user: testUser, hardwareItem: piHardwareItem};

      await hardwareRepository.save(piHardwareItem);
      await reservedHardwareRepository.save(testItemReservation);
      const reservationStatus: string = await hardwareService.reserveItem(testUser, String(piHardwareItem.id));
      expect(reservationStatus).toBeUndefined();
    });
    test("Should ensure reserveItem can be called with requestedQuantity", async (): Promise<void> => {
       // Test setup
       await hardwareRepository.save(piHardwareItem);

       const reservationToken: string = await hardwareService.reserveItem(testUser, String(piHardwareItem.id), 2);
       expect(reservationToken).toBeDefined();
     });
  });

  /**
   * Test takeItem
   */
  describe("Take item tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;
    let userRepository: Repository<User>;
    let reservedHardwareRepository: Repository<ReservedHardwareItem>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
      userRepository = getRepository(User);
      reservedHardwareRepository = getRepository(ReservedHardwareItem);
      await userRepository.save(testUser);
    });

    test("Should ensure take item when valid reservation", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);
      const testReservation: ReservedHardwareItem = {...itemReservation, user: testUser, hardwareItem: piHardwareItem};
      await reservedHardwareRepository.save(testReservation);

      // Try to take the item
      const takenItem: boolean = await hardwareService.takeItem(testReservation.reservationToken);
      expect(takenItem).toBeTruthy();

      // Check that the reservation was updated and stock adjusted correctly
      const reservations: ReservedHardwareItem[] = await reservedHardwareRepository.find();
      expect(reservations.length).toBe(1);
      expect(reservations[0].isReserved).toBeFalsy();

      const updatedItem: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);

      // We expect that the reserved stock is -1 since we don't modify the reserved stock when the add the reservation to the database
      expect(updatedItem.reservedStock).toBe(-1);
      expect(updatedItem.takenStock).toBe(1);
    });
    test("Should ensure reservation deleted when taking and reservation expired", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);
      const testReservation: ReservedHardwareItem = {...itemReservation, user: testUser, hardwareItem: piHardwareItem, reservationExpiry: new Date()};
      await reservedHardwareRepository.save(testReservation);

      // Try to take the item with expired reservation, should throw an error
      try {
        await hardwareService.takeItem(testReservation.reservationToken);
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }

      // Check that the reservation was deleted from the database
      const foundReservation = await reservedHardwareRepository.findOne(testReservation);
      expect(foundReservation).toBeUndefined();
    });
    test("Should ensure error thrown when item already taken", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);
      const testReservation: ReservedHardwareItem = {...itemReservation, user: testUser, hardwareItem: piHardwareItem, isReserved: false };
      await reservedHardwareRepository.save(testReservation);

      try {
        await hardwareService.takeItem(testReservation.reservationToken);
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }
    });
    test("Should ensure undefined when no reservation", async (): Promise<void> => {
      const takenItem: boolean = await hardwareService.takeItem("ThisIsInvalidToken");
      expect(takenItem).toBeFalsy();
    });
  });

  /**
   * Test returnItem
   */
  describe("Return item tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;
    let userRepository: Repository<User>;
    let reservedHardwareRepository: Repository<ReservedHardwareItem>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
      userRepository = getRepository(User);
      reservedHardwareRepository = getRepository(ReservedHardwareItem);
      await userRepository.save(testUser);
    });

    test("Should ensure return item when valid reservation", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);
      const testReservation: ReservedHardwareItem = {...itemReservation, user: testUser, hardwareItem: piHardwareItem, isReserved: false};
      await reservedHardwareRepository.save(testReservation);

      // Try to return the item
      const returnedItem: boolean = await hardwareService.returnItem(testReservation.reservationToken);
      expect(returnedItem).toBeTruthy();

      // Check that the reservation was deleted and stock adjusted correctly
      const reservations: ReservedHardwareItem[] = await reservedHardwareRepository.find();
      expect(reservations.length).toBe(0);

      const updatedItem: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);

      expect(updatedItem.reservedStock).toBe(0);
      expect(updatedItem.takenStock).toBe(-1);
    });
    test("Should ensure reservation deleted when returned and item not taken yet", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);
      const testReservation: ReservedHardwareItem = {...itemReservation, user: testUser, hardwareItem: piHardwareItem, isReserved: true};
      await reservedHardwareRepository.save(testReservation);

      // Try to take the item with expired reservation, should throw an error
      try {
        await hardwareService.returnItem(testReservation.reservationToken);
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }

      // Check that the reservation was deleted from the database
      const foundReservation = await reservedHardwareRepository.findOne(testReservation);
      expect(foundReservation).toBeUndefined();
    });
    test("Should ensure undefined when no reservation", async (): Promise<void> => {
      const takenItem: boolean = await hardwareService.returnItem("ThisIsInvalidToken");
      expect(takenItem).toBeFalsy();
    });
  });

  /**
   * Test getAllHardwareItemsWithReservations
   */
  describe("getAllHardwareItemsWithReservations tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;
    let userRepository: Repository<User>;
    let reservedHardwareRepository: Repository<ReservedHardwareItem>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
      userRepository = getRepository(User);
      reservedHardwareRepository = getRepository(ReservedHardwareItem);
      await userRepository.save(testUser);
    });

    test("Should ensure all reservations of hardware can be found", async (): Promise<void> => {
      const array_len: number = 10;
      // Test setup, create 10 users with 10 reservations
      await hardwareRepository.save(piHardwareItem);
      await hardwareRepository.save(viveHardwareItem);
      for (let i = 1; i <= array_len; i++) {
        const tmpTestUser: User = {...testUser, id: i, email: `test${i}@test.com` };
        await userRepository.save(tmpTestUser);

        const tmpTestReservation: ReservedHardwareItem = {...itemReservation, user: tmpTestUser, hardwareItem: piHardwareItem, reservationToken: `t${i}`};
        await reservedHardwareRepository.save(tmpTestReservation);
      }

      const allReservations: HardwareItem[] = await hardwareService.getAllHardwareItemsWithReservations();

      expect(allReservations).toBeDefined();
      expect(allReservations.length).toBe(2);

      const reservation: HardwareItem = allReservations[0];
      expect(reservation.id).toBe(piHardwareItem.id);
      expect(reservation.reservations.length).toBe(array_len);

      expect(allReservations[1].reservations.length).toBe(1);
      expect(allReservations[1].reservations[0]).toBeInstanceOf(ReservedHardwareItem);
    });
  });

  /**
   * Test getAllHardwareItems
   */
  describe("getAllHardwareItems tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;
    let reservedHardwareRepository: Repository<ReservedHardwareItem>;
    let userRepository: Repository<User>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
      reservedHardwareRepository = getRepository(ReservedHardwareItem);
      userRepository = getRepository(User);
      await userRepository.save(testUser);
    });

    test("Should ensure all hardware items are returned", async (): Promise<void> => {
      const array_len: number = 10;
      for (let i = 1; i <= array_len; i++) {
        await hardwareRepository.save({...piHardwareItem, id: i, name: `h${i}`});
      }

      const allItems: Object[] = await hardwareService.getAllHardwareItems();
      expect(allItems.length).toBe(array_len);
    });

    test("Should ensure all empty array when no items", async (): Promise<void> => {
      const allItems: Object[] = await hardwareService.getAllHardwareItems();
      expect(allItems.length).toBe(0);
      expect(allItems).toEqual([]);
    });
  });

  /**
   * Test addAllHardwareItems
   */
  describe("addAllHardwareItems tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
    });

    test("Should ensure that multiple hardware items can be added at once", async (): Promise<void> => {
      const array_len: number = 10;
      const itemsToAdd: Object[] = [];
      for (let i = 1; i <= array_len; i++) {
        itemsToAdd.push({...piHardwareItem, id: i, name: `h${i}`});
      }

      // Try adding all the items at once
      await hardwareService.addAllHardwareItems(itemsToAdd);

      const itemsAdded: HardwareItem[] = await hardwareRepository.find();
      expect(itemsAdded.length).toBe(array_len);
    });
  });

  /**
   * Test deleteHardwareItem
   */
  describe("deleteHardwareItem tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;
    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
    });

    test("Should ensure that existing item can be deleted", async (): Promise<void> => {
      // Test setup
      const array_len: number = 10;
      const itemsToAdd: Object[] = [];
      for (let i = 1; i <= array_len; i++) {
        itemsToAdd.push({...piHardwareItem, id: i, name: `h${i}`});
      }
      await hardwareRepository.save(itemsToAdd);

      // Perform the test
      await hardwareService.deleteHardwareItem(1);

      const itemShouldBeDeleted: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);
      expect(itemShouldBeDeleted).toBe(undefined);
    });

    test("Should ensure that item not deleted when doesn't exist", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);

      // Perform the test
      try {
        await hardwareService.deleteHardwareItem(2);
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }
      // Check that the item was not deleted
      const itemDeleted: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);
      expect(itemDeleted).toBeDefined();
    });

    test("Should ensure that item not deleted when taken stock", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save({...piHardwareItem, takenStock: 1});

      // Perform the test
      try {
        await hardwareService.deleteHardwareItem(1);
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }
      // Check that the item was not deleted
      const itemDeleted: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);
      expect(itemDeleted).toBeDefined();
    });
    test("Should ensure that item not deleted when reserved stock", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save({...piHardwareItem, reservedStock: 1});

      // Perform the test
      try {
        await hardwareService.deleteHardwareItem(1);
      } catch (e) {
        expect(e.statusCode).toBe(HttpResponseCode.BAD_REQUEST);
      }
      // Check that the item was not deleted
      const itemDeleted: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);
      expect(itemDeleted).toBeDefined();
    });
  });

  /**
   * Test updateHardwareItem
   */
  describe("updateHardwareItem tests", (): void => {
    let hardwareRepository: Repository<HardwareItem>;

    beforeEach(async (): Promise<void> => {
      hardwareRepository = getRepository(HardwareItem);
    });

    test("Should ensure that item can be updated", async (): Promise<void> => {
      // Test setup
      await hardwareRepository.save(piHardwareItem);

      const newURL: string = "http://test.uk/img.png";

      const newHardwareItem: HardwareItem = {...piHardwareItem, itemURL: newURL};
      await hardwareService.updateHardwareItem(newHardwareItem);

      const updatedItem: HardwareItem = await hardwareRepository.findOne(piHardwareItem.id);
      expect(updatedItem).toBeDefined();
      expect(updatedItem.itemURL).toBe(newURL);
    });
  });
});

afterAll(async (): Promise<void> => {
  await closeTestDatabaseConnection();
});