import { Request, Response } from "express";
import { NextFunction } from "connect";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { sendOneSignalNotification } from "../util/announcement";

/**
 * A controller for the announcement methods
 */
export class AnnouncementController {
  public async announce(req: Request, res: Response, next: NextFunction) {
    try {
      const message = req.body.message;
      if (!message) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No message provided!");
      } else if (message.length > 255) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "Message too long!");
      }
      const announcement = new Announcement(message);
      await getConnection("hub")
        .getRepository(Announcement)
        .save(announcement);
      res.send(announcement);
    } catch (error) {
      return next(error);
    }
  }

  public async pushNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const text: string = req.body.message;
      const result: Object = await sendOneSignalNotification(text);
      res.send(result);
    } catch (error) {
      return next(error);
    }
  }
}