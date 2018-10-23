import "reflect-metadata";
import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as morgan from "morgan";
import * as errorHandler from "errorhandler";
import * as passport from "passport";
import { createPassportLocalStrategy } from "./util/createPassportStrategy";
import { Express, Request, Response, NextFunction } from "express";
import { getUserByEmailFromHub } from "./util/user/userValidation";
import { Connection, createConnections } from "typeorm";
import { User } from "./db/entity/user";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Routers
import { LoginRouter } from "./routes";

export function buildApp(callback: (app: Express, err?: Error) => void): void {
  const app: Express = expressSetup();

  setUpPassport();

  middlewareSetup(app);

  devMiddlewareSetup(app);

  // Routes set up
  app.use("/", LoginRouter());

  // Connecting to database
  createConnections([{
    name: "hub",
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
      __dirname + "/db/entity/user{.js,.ts}"
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
      __dirname + "/db/entity/applicationUser{.js,.ts}"
    ],
    synchronize: false,
    logging: false,
    extra: {
      ssl: true
    }
  }]).then((connections: Connection[]) => {
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
 * Creates the passport middleware for handling user authentication
 */
const setUpPassport = (): void => {
  // Passport configuration
  passport.use(createPassportLocalStrategy());

  // Passport serialization
  passport.serializeUser((user: User, done: Function): void => {
    done(undefined, user.id);
  });

  // Passport deserialization
  passport.deserializeUser(async (email: string, done: Function): Promise<void> => {
    try {
      const user: User = await getUserByEmailFromHub(email);
      if (!user) {
        return done(new Error("User not found"));
      }
      done(undefined, user.id);
    } catch (err) {
      done(err);
    }
  });
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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(passport.session());
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
    // Error Handler. Provides full stack
    app.use(errorHandler());
  }
};