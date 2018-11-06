import "reflect-metadata";
import * as express from "express";
import * as dotenv from "dotenv";
import * as path from "path";
import * as morgan from "morgan";
import * as passport from "passport";
import * as expressSession from "express-session";
import * as cookieParser from "cookie-parser";
import { passportLocalStrategy } from "./util/user/passportLocalStrategy";
import { Express, Request, Response, NextFunction } from "express";
import { Connection, createConnections, ConnectionOptions } from "typeorm";
import { errorHandler, error404Handler } from "./util/errorHandling";
import { mainRouter } from "./routes";

// Load environment variables from .env file
dotenv.config({ path: ".env" });


// codebeat:disable[LOC]
export function buildApp(callback: (app: Express, err?: Error) => void): void {
  const app: Express = expressSetup();

  middlewareSetup(app);

  devMiddlewareSetup(app);

  passportSetup(app);

  // Routes set up
  app.use("/", mainRouter());

  // Setting up error handlers
  app.use(error404Handler);
  app.use(errorHandler);

  // Connecting to database
  createConnections(createDatabaseOptions()).then((connections: Connection[]) => {
    connections.forEach(element => {
      console.log("  Connection to database (" + element.name + ") established.");
    });
    return callback(app);
  }).catch((err: any) => {
    console.error("  Could not connect to database");
    console.error(err);
    return callback(app, err);
  });
}

/**
 * Creates an Express app
 */
const expressSetup = (): Express => {
  // Create Express server
  const app = express();

  // Express configuration
  app.set("port", process.env.PORT || 3000);
  app.set("env", process.env.ENVIRONMENT || "production");

  return app;
};

/**
 * Sets up middleware used by the app
 * @param app The app to set up the middleware for
 */
const middlewareSetup = (app: Express): void => {
  app.use(
    express.static(path.join(__dirname, "public"),
      { maxAge: 31557600000 })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(expressSession(getSessionOptions(app)));
};

/**
 * Sets up middleware used on development environments
 * @param app The app to set up the middleware for
 */
const devMiddlewareSetup = (app: Express): void => {
  // Development environment set up
  if (app.get("env") === "dev") {
    // Request logging
    app.use(morgan("dev"));
    // Disable browser caching
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
      res.header("Expires", "-1");
      res.header("Pragma", "no-cache");
      next();
    });
  }
};

/**
 * Creates the passport middleware for handling user authentication
 * @param app The app to set up the middleware for
 */
const passportSetup = (app: Express): void => {
  app.use(passport.initialize());
  app.use(passport.session());
  // Passport configuration
  passport.use(passportLocalStrategy());
};

const getSessionOptions = (app: Express): any => {
  return {
    saveUninitialized: true, // Saved new sessions
    resave: false, // Do not automatically write to the session store
    secret: process.env.SESSION_SECRET,
    cookie: { // Configure when sessions expires
      secure: (app.get("env") === "dev" ? false : true),
      maxAge: 2419200000
    }
  };
};

const createDatabaseOptions = (): ConnectionOptions[] => {
  return [{
    name: "hub",
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
      __dirname + "/db/entity/hub/*{.js,.ts}"
    ],
    // Per TypeOrm documentation, this is unsafe for production
    // We should instead use migrations to change the database
    // once we have it in production.
    synchronize: true,
    logging: false
  }, {
    name: "applications",
    type: "postgres",
    host: process.env.APP_DB_HOST,
    port: Number(process.env.APP_DB_PORT),
    username: process.env.APP_DB_USER,
    password: process.env.APP_DB_PASSWORD,
    database: process.env.APP_DB_DATABASE,
    entities: [
      __dirname + "/db/entity/applications/*{.js,.ts}"
    ],
    synchronize: false,
    logging: false,
    extra: {
      ssl: true
    }
  }];
};