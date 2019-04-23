import * as dotenv from "dotenv";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { Challenge, Announcement } from "../../../src/db/entity/hub";
import { AnnouncementService } from "../../../src/services/announcement";

const testAnnouncement: Announcement = new Announcement("Test Announcement");

let announcementService: AnnouncementService;

beforeAll(async (): Promise<void> => {
  dotenv.config({ path: ".env" });

  await createTestDatabaseConnection([ Announcement ]);
  announcementService = new AnnouncementService(getRepository(Announcement));
});

beforeEach(async (): Promise<void> => {
  await reloadTestDatabaseConnection();
});

/**
 * Announcement tests
 */
describe("Announcement service tests", (): void => {
  /**
   * Test finding the most recent announcements
   */
  test("Should ensure most recent announcements can be found", async (): Promise<void> => {
    const TOTAL_ANNOUNCEMENTS: number = 10;
    const RECENT_ANNOUNCEMENTS: number = 4;

    // Test setup, store the test announcements
    const announcementRepository: Repository<Announcement> = getRepository(Announcement);
    for (let i = 1; i <= TOTAL_ANNOUNCEMENTS; i++) {
      await announcementRepository.save({...testAnnouncement, id: i, message: `${i}`});
    }

    // Ensure that we can find the most recent announcements
    const recentAnnouncements: Announcement[] = await announcementService.getMostRecentAnnouncements(RECENT_ANNOUNCEMENTS);
    expect(recentAnnouncements).toBeDefined();
    expect(recentAnnouncements.length).toBe(RECENT_ANNOUNCEMENTS);
  });
  test("Should return empty array with no announcements", async (): Promise<void> => {
    // Ensure that an empty array returned with no announcements
    const recentAnnouncements: Announcement[] = await announcementService.getMostRecentAnnouncements(1);
    expect(recentAnnouncements).toBeDefined();
    expect(recentAnnouncements.length).toBe(0);
  });

  /**
   * Test creating an announcements
   */
  test("Should ensure an announcement can be created", async (): Promise<void> => {
    // Test setup, create repositoy
    const announcementRepository: Repository<Announcement> = getRepository(Announcement);

    // Perform the test with the announcement service
    await announcementService.createAnnouncement(testAnnouncement);

    // Ensure that the announcement was made successfully
    const foundAnnouncement: Announcement = await announcementRepository.findOne(testAnnouncement);
    expect(foundAnnouncement).toBeDefined();
    expect(foundAnnouncement.id).toBe(testAnnouncement.id);
  });
});

afterAll(async (): Promise<void> => {
  await closeTestDatabaseConnection();
});