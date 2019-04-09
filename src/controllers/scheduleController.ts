import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Event } from "../db/entity/hub";
import { Cache } from "../util/cache";
import { ValidationError, validate } from "class-validator";

// TODO: move into the controller when JS functions are replaced with arrow functions
let cache: Cache;

export class ScheduleController {

  constructor(_cache: Cache) {
    cache = _cache;
  }

  public async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      let events: Event[] = cache.getAll(Event.name);

      if (events.length === 0) {
        events = await getConnection("hub").getRepository(Event).find();
        cache.setAll(Event.name, events);
      }

      res.send(events);
    } catch (err) {
      return next(err);
    }
  }

  public async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, startTime, endTime, location } = req.body;
      const newEvent: Event = new Event(title, new Date(startTime), new Date(endTime), location);

      const errors: ValidationError[] = await validate(newEvent);

      if (errors.length > 0) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not create event: ${errors.join(",")}`));
      }

      await getConnection("hub").getRepository(Event).save(newEvent);
      // Clearing the cache since all events in the cache must have
      // the same lifetime and a new item in the cache would have a
      // longer lifetime than the other events
      cache.deleteAll(Event.name);
      res.send(newEvent);
    } catch (err) {
      return next(err);
    }
  }

  public async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;

      if (!id)
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          "The id of the event to delete was not provided. Expected: id"));

      await getConnection("hub")
        .createQueryBuilder()
        .delete()
        .from(Event)
        .where("id = :id", { id })
        .execute();

      cache.delete(Event.name, Number(id));

      res.send(`Event ${id} deleted`);
    } catch (err) {
      return next(err);
    }
  }

  public async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, title, startTime, endTime, location } = req.body;

      let eventToUpdate: Event = cache.get(Event.name, Number(id));
      if (!eventToUpdate) {
        eventToUpdate = await getConnection("hub").getRepository(Event).findOne(id);
        if (!eventToUpdate) {
          return next(new ApiError(HttpResponseCode.BAD_REQUEST,
            `Could not find event with given id`));
        }
      }

      const updatedEvent = new Event(title, new Date(startTime), new Date(endTime), location);
      updatedEvent.id = eventToUpdate.id;

      const errors: ValidationError[] = await validate(updatedEvent);

      if (errors.length > 0) {
        return next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not update event: ${errors.join(",")}`));
      }

      await getConnection("hub").getRepository(Event).save(updatedEvent);
      // Clearing the cache since all events in the cache must have
      // the same lifetime and updating an object in the cache
      // resets its lifetime
      cache.deleteAll(Event.name);
      res.send(updatedEvent);
    } catch (err) {
      return next(err);
    }
  }
}