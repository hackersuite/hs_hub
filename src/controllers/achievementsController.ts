import { Request, Response, NextFunction } from "express";
import { AchievementsService, AchievementsProgressService } from "../services";
import { Achievement } from "../util/achievements";
import { AchievementProgress, User } from "../db/entity/hub";
import { getUserByIDFromHub } from "../util/user/";
import { ApiError, HttpResponseCode } from "../util/errorHandling";
import { sendPushNotificationByUserID } from "../util/announcement";

// TODO: find a better solution because this is just horrific 
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
      const achievements: Achievement[] = await achievementsService.getAchievements();
      const achievementsProgress: AchievementProgress[] = await achievementsProgressService.getAchievementsProgressForUser(req.user);

      const progressMap: Map<number, AchievementProgress> = new Map<number, AchievementProgress>();
      achievementsProgress.forEach((achievementProgress: AchievementProgress) => {
        progressMap.set(achievementProgress.getAchievementId(), achievementProgress);
      })

      res.render("pages/achievements", { achievements, progress: progressMap });
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

      sendPushNotificationByUserID(`Congratulations you have completed the achievement ${achievement.getTitle()}!
       You can now claim your prize at the hardware library.`, userId);

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

      if (achievementProgress.achievementIsCompleted()) {
        res.send({ message: `Congratulations! You have completed the achievement ${achievement.getTitle()}! You can now claim your prize at the hardware library.`});
      } else {
        res.send({ message: `Progress for achievement "${achievement.getTitle()}" updated. Your new progress is: ${achievementProgress.getProgress()}/${achievement.getMaxProgress()}!`});
      }
    } catch (err) {
      next(err);
    }
  }

  public async test(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.send(await achievementsProgressService.getAchievementsProgressThatCanClaimPrize());
  }


  // public async setUserProgressForAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const { userId, progress, steps } = req.body;
  //     const achievementId = req.params.achievementId;
  //     if (!userId || !achievementId || !progress) {
  //       throw new ApiError(HttpResponseCode.BAD_REQUEST, "Not all parameters provided! Expected: achievementId, userId, progress");
  //     }
  //     const user: User = await getConnection("hub")
  //       .getRepository(User)
  //       .createQueryBuilder("user")
  //       .where("user.id = :userId", { userId })
  //       .getOne();
  //     if (!user) {
  //       throw new ApiError(HttpResponseCode.BAD_REQUEST, "User with given id not found!");
  //     }
  //     const userProgressInCache = await Cache.achievementsProgess.getElementForUser(user, achievementId);
  //     const stepsCompleted = userProgressInCache ? userProgressInCache.stepsCompleted : "" + steps || "";
  //     const userProgress = await Achievements.getAchievementWithId(achievementId).updateUsersProgress(user, progress, stepsCompleted);
  //     res.send(userProgress);
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}