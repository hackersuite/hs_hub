import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Event } from "../db/entity";
import { Cache } from "../util/cache";

/**
 * A controller for auth methods
 */
export class ScheduleController {

  public async listEvents(req: Request, res: Response) {
    res.send(await Cache.events.getElements());
  }

  public async createEvent(req: Request, res: Response, next: NextFunction) {
    const { title, startTime, endTime, location } = req.body;
    if (!title || !startTime || !endTime || !location)
      return next(new ApiError(HttpResponseCode.BAD_REQUEST,
                              "Not all parameters were specified. Expected: title, startTime, endTime, location"));
    // TODO: add an if to check if startTime and endTime are dates
    const createdEventId = (await getConnection("hub")
    .createQueryBuilder()
    .insert()
    .into(Event)
    .values([
        { title, startTime, endTime, location }
     ])
    .execute()).identifiers[0].id;
    await Cache.events.sync();
    res.send(await Cache.events.getElement(createdEventId));
  }

  public async deleteEvent(req: Request, res: Response, next: NextFunction) {
    const {title} = req.body;
    /*
    // Looping through the indetifiers[] to find the id
    // of the intended event to get deleted
    for (let index = 0; index < InsertResult.identifiers.length; index++) {

    }
    if (!title)
      return next(new ApiError(HttpResponseCode.BAD_REQUEST,
                                "The title of the deleted event is not provided. Expected: title "));
    const deletedEvent = (await getConnection("hub")
    .createQueryBuilder()
    .delete()
    .from(Event)
    .where("title = :titleToDelete", { titleToDelete: title })
    .execute()).id;*/
  }
}