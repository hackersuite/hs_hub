import { Request, Response, NextFunction } from "express";
import { AchievementsService, AchievementsProgressService } from "../services";
import { Achievement } from "../util/achievements";
import { AchievementProgress, User } from "../db/entity/hub";
import { getUserByIDFromHub, getAllUsers } from "../util/user/";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { sendPushNotificationByUserID } from "../util/announcement";

// TODO: move into the controller when JS functions are replaced with arrow functions
let achievementsService: AchievementsService;
let achievementsProgressService: AchievementsProgressService;

/**
 * A controller for the achievements methods
 */
export class AchievementsController {
  constructor(_achievementsService: AchievementsService, _achievementsProgressService: AchievementsProgressService) {
    achievementsService = _achievementsService;
    achievementsProgressService = _achievementsProgressService;
  }

  public async getAchievementsPage(req: Request, res: Response, next: NextFunction) {
    try {
      let achievements: Achievement[] = await achievementsService.getAchievements();
      achievements = achievements.sort((a: Achievement, b: Achievement) => a.getTitle().localeCompare(b.getTitle()));

      const achievementsProgress: AchievementProgress[] = await achievementsProgressService.getAchievementsProgressForUser(req.user);

      const progressMap: Map<number, AchievementProgress> = new Map<number, AchievementProgress>();
      achievementsProgress.forEach((achievementProgress: AchievementProgress) => {
        progressMap.set(achievementProgress.getAchievementId(), achievementProgress);
      });

      const notification = req.session.notification;
      req.session.notification = undefined;

      res.render("pages/achievements/index", { achievements, progress: progressMap, notification });
    } catch (err) {
      next(err);
    }
  }

  public async getVolunteersPage(req: Request, res: Response, next: NextFunction) {
    try {
      let users: User[] = await getAllUsers();
      users = users.sort((a: User, b: User) => a.getName().localeCompare(b.getName()));

      let achievements: Achievement[] = await achievementsService.getAchievements();
      achievements = achievements.sort((a: Achievement, b: Achievement) => a.getTitle().localeCompare(b.getTitle()));

      let prizesToClaim: AchievementProgress[] = await achievementsProgressService.getAchievementsProgressThatCanClaimPrize();
      prizesToClaim = prizesToClaim.sort((a: AchievementProgress, b: AchievementProgress) => {
        const achievementsComparison: number = a.getAchievement().getTitle().localeCompare(b.getAchievement().getTitle());
        if (achievementsComparison === 0) {
          return a.getUser().getName().localeCompare(b.getUser().getName());
        } else {
          return achievementsComparison;
        }
      });

      const notification = req.session.notification;
      req.session.notification = undefined;

      res.render("pages/achievements/volunteerControls", { users, achievements, prizesToClaim, notification });
    } catch (err) {
      next(err);
    }
  }


  public async getAllAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const achievements: Achievement[] = await achievementsService.getAchievements();
      res.send(achievements);
    } catch (err) {
      next(err);
    }
  }

  public async getProgressForAllAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress: AchievementProgress[] =
        await achievementsProgressService.getAchievementsProgressForUser(req.user);
      res.send(progress);
    } catch (err) {
      next(err);
    }
  }

  public async getProgressForAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievement: Achievement = await achievementsService.getAchievementWithId(Number(req.params.id));
      const progress: AchievementProgress = await achievementsProgressService.getAchievementProgressForUser(achievement, req.user);

      res.send(progress);
    } catch (err) {
      next(err);
    }
  }

  public async completeAchievementForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievement: Achievement = await achievementsService.getAchievementWithId(Number(req.params.id));

      const { userId } = req.body;
      if (userId === undefined)
        throw new ApiError(HttpResponseCode.BAD_REQUEST, `Please provide a userId!`);

      const user: User = await getUserByIDFromHub(req.body.userId);
      // TODO: this check should be implemented in getUserByIDFromHub
      if (!user)
        throw new ApiError(HttpResponseCode.BAD_REQUEST, `Could not find user with id ${userId}!`);

      await achievementsProgressService.setAchievementCompleteForUser(achievement, user);

      sendPushNotificationByUserID(`Congratulations you have completed the achievement ${achievement.getTitle()}!`, userId);

      req.session.notification = {
        type: "success",
        message: `Achievement ${achievement.getTitle()} has been awarded to user ${user.getName()}!`
      };

      res.send({ message: `Achievement ${achievement.getTitle()} has been awarded to user ${user.getName()}!`});
    } catch (err) {
      next(err);
    }
  }

  public async completeAchievementStep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievement: Achievement = await achievementsService.getAchievementWithId(Number(req.params.id));

      const { step } = req.params;
      const { token } = req.query;
      if (step === undefined)
        throw new ApiError(HttpResponseCode.BAD_REQUEST, `Please provide a step to complete!`);

      const achievementProgress: AchievementProgress = await achievementsProgressService.completeAchievementStepForUser(Number(step), token, achievement, req.user);

      let message: string;
      if (achievementProgress.achievementIsCompleted()) {
        message = `Congratulations! You have completed the achievement ${achievement.getTitle()}! Check out the schedule to find out when you'll be able to claim your prize.`;
      } else {
        message = `Progress for achievement "${achievement.getTitle()}" updated. Your new progress is: ${achievementProgress.getProgress()}/${achievement.getMaxProgress()}!`;
      }

      req.session.notification = {
        type: "success",
        message
      };

      res.redirect("/achievements")
    } catch (err) {
      req.session.notification = {
        type: "danger",
        message: err.message
      };

      res.redirect("/achievements")
    }
  }

  public async givePrizeToUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievementId: number = req.params.id;
      const achievement: Achievement = await achievementsService.getAchievementWithId(Number(achievementId));

      const { userId } = req.body;
      const user: User = await getUserByIDFromHub(userId);

      await achievementsProgressService.giveAchievementPrizeToUser(achievement, user);

      req.session.notification = {
        type: "success",
        message: `Prize for achievement ${achievement.getTitle()} awarded to user ${user.getName()}`
      };

      res.send({ message: `Prize for achievement ${achievement.getTitle()} awarded to user ${user.getName()}`});
    } catch (err) {
      req.session.notification = {
        type: "danger",
        message: err.message
      };

      res.redirect("/achievements")
    }
  }

  public async getAchievementToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievementId: number = req.params.id;
      const step: number = req.params.step;
      const achievement: Achievement = await achievementsService.getAchievementWithId(Number(achievementId));

      res.send({ message: achievement.generateToken(step) });
    } catch (err) {
      next(err);
    }
  }
}