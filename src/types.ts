export const TYPES = {
  Router: Symbol.for("Router"),

  UserController: Symbol.for("UserController"),
  TeamController: Symbol.for("TeamController"),
  ScheduleController: Symbol.for("ScheduleController"),
  HomeController: Symbol.for("HomeController"),
  HardwareController: Symbol.for("HardwareController"),
  ChallengeController: Symbol.for("ChallengeController"),
  AnnouncementController: Symbol.for("AnnouncementController"),
  AchievementsController: Symbol.for("AchievementsController"),

  UserService: Symbol.for("UserService"),
  TeamService: Symbol.for("TeamService"),
  HardwareService: Symbol.for("HardwareService"),
  ReservedHardwareService: Symbol.for("ReservedHardwareService"),
  ChallengeService: Symbol.for("ChallengeService"),
  AnnouncementService: Symbol.for("AnnouncementService"),
  AchievementsService: Symbol.for("AchievementsService"),
  AchievementsProgressService: Symbol.for("AchievementsProgressService"),
  EventService: Symbol.for("EventService"),

  UserRepository: Symbol.for("UserRepository"),
  HardwareRepository: Symbol.for("HardwareRepository"),
  ReservedHardwareRepository: Symbol.for("ReservedHardwareRepository"),
  EventRepository: Symbol.for("EventRepository"),
  ChallengeRepository: Symbol.for("ChallengeRepository"),
  AnnouncementRepository: Symbol.for("AnnouncementRepository"),
  LocalAchievementsRepository: Symbol.for("LocalAchievementsRepository"),
  AchievementsProgressRepository: Symbol.for("AchievementsProgressRepository"),

  RequestAuthentication: Symbol.for("RequestAuthentication"),
  Cache: Symbol.for("Cache")
};