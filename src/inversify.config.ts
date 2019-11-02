import { Container } from "inversify";
import { TYPES } from "./types";

// Routers
import { RequestAuthenticationInterface, RequestAuthentication } from "./util/hs_auth";
import { CacheInterface, Cache } from "./util/cache";


const container = new Container();

// Request Authentication
container.bind<RequestAuthenticationInterface>(TYPES.RequestAuthentication).to(RequestAuthentication);
// Constants
container.bind<CacheInterface>(TYPES.Cache).toConstantValue(new Cache());

export default container;