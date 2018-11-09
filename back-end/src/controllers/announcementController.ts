import { Request, Response } from "express";
import { NextFunction } from "connect";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";

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
      await getConnection("hub")
        .getRepository(Announcement)
        .save(new Announcement(message));
      res.send({ message: "Announcement created successfully!" });
    } catch (error) {
      return next(error);
    }
  }
}