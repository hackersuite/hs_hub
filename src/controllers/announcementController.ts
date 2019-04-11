import { Request, Response } from "express";
import { NextFunction } from "connect";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { Announcement } from "../db/entity/hub";
import { getConnection } from "typeorm";
import { sendOneSignalNotification } from "../util/announcement";
import { User } from "../db/entity/hub/user";
import { AnnouncementService } from "../services/announcement/announcementService";
import { UserService } from "../services/users";

/**
 * A controller for the announcement methods
 */
export class AnnouncementController {
  private announcementService: AnnouncementService;
  private userService: UserService;

  constructor(_announcementService: AnnouncementService, _userService: UserService) {
    this.announcementService = _announcementService;
    this.userService = _userService;
  }

  announce = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = req.body.message;
      if (!message) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "No message provided!");
      } else if (message.length > 255) {
        throw new ApiError(HttpResponseCode.BAD_REQUEST, "Message too long!");
      }
      const announcement = new Announcement(message);
      await this.announcementService.createAnnouncement(announcement);
      res.send(announcement);
    } catch (error) {
      return next(error);
    }
  };

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
  pushNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const text: string = req.body.message;
      const includedUsers: string = req.body.included_users;
      let userIds: string[] = [];
      if (includedUsers !== undefined) {
        const includedUsersObj: Object = JSON.parse(includedUsers);
        if (includedUsersObj.hasOwnProperty("users")) {
          userIds = includedUsersObj["users"];
        }
      }

      const result: Object = await sendOneSignalNotification(text, userIds);
      if (result.hasOwnProperty("errors") === false)
        res.send(result);
      else
        res.status(HttpResponseCode.INTERNAL_ERROR).send(`Failed to send the push notification!. ${JSON.stringify(result)}`);
    } catch (error) {
      return next(error);
    }
  };

  pushNotificationRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playerID: string = req.body.data;
      await this.userService.addPushIDToUser(req.user, playerID);
      res.status(200).send(`Updated with player ID: ${playerID}`);
    } catch (error) {
      return next(error);
    }
  };
}