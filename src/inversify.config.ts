import { Container } from "inversify";
import { TYPES } from "./types";

// Routers
import { RequestAuthenticationInterface, RequestAuthentication } from "./util/hs_auth";
import { CacheInterface, Cache } from "./util/cache";
import { RouterInterface, HomeRouter } from "./routes";

// Users
import { UserRouter } from "./routes"
import { UserController, UserControllerInterface, HomeControllerInterface, HomeController } from "./controllers"
import { UserService, UserServiceInterface } from "./services/users";

// Teams
import { TeamRouter } from "./routes"
import { TeamController, TeamControllerInterface } from "./controllers"
import { TeamService, TeamServiceInterface } from "./services/teams";

// Schedule
import { ScheduleRouter } from "./routes"
import { ScheduleController, ScheduleControllerInterface } from "./controllers"

// Hardware
import { HardwareRouter } from "./routes"
import { HardwareController, HardwareControllerInterface } from "./controllers"
import { HardwareService, ReservedHardwareService, HardwareServiceInterface, ReservedHardwareServiceInterface } from "./services/hardware";

// Challenges
import { ChallengeRouter } from "./routes"
import { ChallengeController, ChallengeControllerInterface } from "./controllers"
import { ChallengeService, ChallengeServiceInterface } from "./services/challenges";

// Announcements
import { AnnouncementRouter } from "./routes"
import { AnnouncementController, AnnouncementControllerInterface } from "./controllers"
import { AnnouncementService, AnnouncementServiceInterface } from "./services/announcement";

// Achievements
import { AchievementsRouter } from "./routes"
import { AchievementsController, AchievementsControllerInterface } from "./controllers"
import { AchievementsService, AchievementsServiceInterface, AchievementsProgressService, AchievementsProgressServiceInterface } from "./services/achievements";

// Events
import { EventService, EventServiceInterface } from "./services/events";
import { UserRepository, HardwareRepository, ReservedHardwareRepository, EventRepository, AnnouncementRepository, AchievementProgressRepository, ChallengeRepository } from "./repositories";
import { LocalAchievementsRepository, localAchievements } from "./util/achievements";

const container = new Container();

// Routers
container.bind<RouterInterface>(TYPES.Router).to(UserRouter);
container.bind<RouterInterface>(TYPES.Router).to(TeamRouter);
container.bind<RouterInterface>(TYPES.Router).to(ScheduleRouter);
container.bind<RouterInterface>(TYPES.Router).to(HomeRouter);
container.bind<RouterInterface>(TYPES.Router).to(HardwareRouter);
container.bind<RouterInterface>(TYPES.Router).to(ChallengeRouter);
container.bind<RouterInterface>(TYPES.Router).to(AnnouncementRouter);
container.bind<RouterInterface>(TYPES.Router).to(AchievementsRouter);

// Home
container.bind<HomeControllerInterface>(TYPES.HomeController).to(HomeController);

// User
container.bind<UserControllerInterface>(TYPES.UserController).to(UserController);
container.bind<UserServiceInterface>(TYPES.UserService).to(UserService);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);

// Team
container.bind<TeamControllerInterface>(TYPES.TeamController).to(TeamController);
container.bind<TeamServiceInterface>(TYPES.TeamService).to(TeamService);

// Schedule
container.bind<ScheduleControllerInterface>(TYPES.ScheduleController).to(ScheduleController);

// Hardware
container.bind<HardwareControllerInterface>(TYPES.HardwareController).to(HardwareController);
container.bind<HardwareServiceInterface>(TYPES.HardwareService).to(HardwareService);
container.bind<ReservedHardwareServiceInterface>(TYPES.ReservedHardwareService).to(ReservedHardwareService);
container.bind<HardwareRepository>(TYPES.HardwareRepository).to(HardwareRepository);
container.bind<ReservedHardwareRepository>(TYPES.ReservedHardwareRepository).to(ReservedHardwareRepository);

// Challenges
container.bind<ChallengeControllerInterface>(TYPES.ChallengeController).to(ChallengeController);
container.bind<ChallengeServiceInterface>(TYPES.ChallengeService).to(ChallengeService);
container.bind<ChallengeRepository>(TYPES.ChallengeRepository).to(ChallengeRepository);


// Announcements
container.bind<AnnouncementControllerInterface>(TYPES.AnnouncementController).to(AnnouncementController);
container.bind<AnnouncementServiceInterface>(TYPES.AnnouncementService).to(AnnouncementService);
container.bind<AnnouncementRepository>(TYPES.AnnouncementRepository).to(AnnouncementRepository);

// Achievements
container.bind<AchievementsControllerInterface>(TYPES.AchievementsController).to(AchievementsController);
container.bind<AchievementsServiceInterface>(TYPES.AchievementsService).to(AchievementsService);
container.bind<AchievementsProgressServiceInterface>(TYPES.AchievementsProgressService).to(AchievementsProgressService);
container.bind<LocalAchievementsRepository>(TYPES.LocalAchievementsRepository).toConstantValue(new LocalAchievementsRepository(localAchievements));
container.bind<AchievementProgressRepository>(TYPES.AchievementsProgressRepository).to(AchievementProgressRepository);

// Events
container.bind<EventServiceInterface>(TYPES.EventService).to(EventService);
container.bind<EventRepository>(TYPES.EventRepository).to(EventRepository);

// Request Authentication
container.bind<RequestAuthenticationInterface>(TYPES.RequestAuthentication).to(RequestAuthentication);
// Constants
container.bind<CacheInterface>(TYPES.Cache).toConstantValue(new Cache());

export default container;