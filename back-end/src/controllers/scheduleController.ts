import { Request, Response, NextFunction } from "express";
import * as passport from "passport";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Event } from "../db/entity";
import { Cache } from "../util/cache";

/**
 * A controller for auth methods
 */
export class ScheduleController {

  public listEvents(req: Request, res: Response) {
  }

  public async createEvent(req: Request, res: Response, next: NextFunction) {
    const { title, startTime, endTime, location } = req.body;
    if (!title || !startTime || !endTime || !location)
      return next(new ApiError(HttpResponseCode.BAD_REQUEST,
                              "Not all parameters were specified. Expected: title, startTime, endTime, location"));
    const createdEvent = await getConnection("hub")
    .createQueryBuilder()
    .insert()
    .into(Event)
    .values([
        { title, startTime, endTime, location }
     ])
    .execute();
    await Cache.events.sync();
    res.send(createdEvent);
  }
}