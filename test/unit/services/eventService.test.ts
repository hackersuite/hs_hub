import * as dotenv from "dotenv";
import { EventService } from "../../../src/services/events";
import { createTestDatabaseConnection, closeTestDatabaseConnection, reloadTestDatabaseConnection } from "../../util/testUtils";
import { getRepository, Repository } from "typeorm";
import { Event } from "../../../src/db/entity/hub";

const testEvent: Event = new Event("Test Event", new Date(), new Date(), "Here");
const testEvent2: Event = new Event("Test Event2", new Date(), new Date(), "Here2");

let eventService: EventService;

beforeAll(async (done: jest.DoneCallback): Promise<void> => {
  dotenv.config({ path: ".env" });

  await createTestDatabaseConnection([ Event ]);
  eventService = new EventService(getRepository(Event));

  done();
});

beforeEach(async (done: jest.DoneCallback): Promise<void> => {
  await reloadTestDatabaseConnection();

  done();
});

/**
 * Event tests
 */
describe("Event service tests", (): void => {
  /**
   * Test finding all events
   */
  test("Should ensure all events can be found", async (): Promise<void> => {
    // Test setup, store the test event
    const eventRepository: Repository<Event> = getRepository(Event);
    await eventRepository.save(testEvent);
    await eventRepository.save(testEvent2);

    // Ensure that we can find all the events
    const allEvents: Event[] = await eventService.findAllEvents();
    expect(allEvents).toBeDefined();
    expect(allEvents.length).toBe(2);
  });

  /**
   * Test creating an event
   */
  test("Should ensure an event can be created", async (): Promise<void> => {
    const eventID: number = await eventService.createEvent("Test", new Date(), new Date(), "Test");
    expect(eventID).toBeDefined();
  });

  /**
   * Test deleting an event
   */
  test("Should ensure a specific event can be deleted", async (): Promise<void> => {
    // Test setup, store the test event
    const eventRepository: Repository<Event> = getRepository(Event);
    await eventRepository.save(testEvent);

    // Test that the event can be deleted
    await eventService.deleteEventByID(testEvent.id);
    const foundEvent: Event = await eventRepository.findOne(testEvent);
    expect(foundEvent).toBeUndefined();
  });
});

afterAll(async (): Promise<void> => {
  await closeTestDatabaseConnection();
});