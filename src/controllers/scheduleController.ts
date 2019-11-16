import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Event } from "../db/entity";
import { Cache } from "../util/cache";
import { ValidationError, validate } from "class-validator";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

export interface ScheduleControllerInterface {
  listEvents: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  createEvent: (req: Request, res: Response, next: NextFunction) => Promise<Event>;
  deleteEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  updateEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
export class ScheduleController implements ScheduleControllerInterface {
  private cache: Cache;

  constructor(@inject(TYPES.Cache) _cache: Cache) {
    this.cache = _cache;
  }

  public listEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let events: Event[] = this.cache.getAll(Event.name);

      if (events.length === 0) {
        events = await getConnection("hub").getRepository(Event).find();
        this.cache.setAll(Event.name, events);
      }

      res.send(events);
    } catch (err) {
      return next(err);
    }
  }

  public createEvent = async (req: Request, res: Response, next: NextFunction): Promise<Event> => {
    try {
      const { title, startTime, endTime, location } = req.body;
      const newEvent: Event = new Event(title, new Date(startTime), new Date(endTime), location);

      const errors: ValidationError[] = await validate(newEvent);

      if (errors.length > 0) {
        next(new ApiError(HttpResponseCode.BAD_REQUEST,
          `Could not create event: ${errors.join(",")}`));
        return;
      }

      await getConnection("hub").getRepository(Event).save(newEvent);
      // Clearing the cache since all events in the cache must have
      // the same lifetime and a new item in the cache would have a
      // longer lifetime than the other events
      this.cache.deleteAll(Event.name);
      res.send(newEvent);
    } catch (err) {
      next(err);
    }
  }

  public deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
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

      this.cache.delete(Event.name, Number(id));

      res.send(`Event ${id} deleted`);
    } catch (err) {
      return next(err);
    }
  }

  public updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, title, startTime, endTime, location } = req.body;

      let eventToUpdate: Event = this.cache.get(Event.name, Number(id));
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
      this.cache.deleteAll(Event.name);
      res.send(updatedEvent);
    } catch (err) {
      return next(err);
    }
  }
}