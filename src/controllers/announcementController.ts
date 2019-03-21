import { Request, Response } from "express";
import { NextFunction } from "connect";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { sendOneSignalNotification } from "../util/announcement";
import { User } from "../db/entity/hub/user";

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

  /**
   * This function will either send a push notifation to all users subscribed to push notifications
   * or to only those users whose ids are provided.
   * 
   * If you want to send to particular users, then include the ids in the post request with the following format:
   * included_users = {"users": ["userId1", "userId2", ...]}
   * @param req
   * @param res
   * @param next
   */
  public async pushNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const text: string = req.body.message;
      const included_users: Object = JSON.parse(req.body.included_users);

      const result: Object = await sendOneSignalNotification(text, included_users["users"]);
      if (result.hasOwnProperty("errors") === false)
        res.send(result);
      else
        res.status(HttpResponseCode.INTERNAL_ERROR).send(`Failed to send the push notification!. ${JSON.stringify(result)}`);
    } catch (error) {
      return next(error);
    }
  }

  public async pushNotificationRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const playerID: string = req.body.data;
      req.user.push_id = playerID;
      await getConnection("hub")
        .getRepository(User)
        .save(req.user);
      res.status(200).send(`Updated with player ID: ${req.user.push_id}`);
    } catch (error) {
      return next(error);
    }
  }
}