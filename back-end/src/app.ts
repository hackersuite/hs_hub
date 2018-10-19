import "reflect-metadata";
import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as morgan from "morgan";
import * as errorHandler from "errorhandler";
import { Express, Request, Response, NextFunction } from "express";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Routers
import { TestRouter } from "./routes";
import { Connection, createConnection, ConnectionOptions } from "typeorm";

// codebeat:disable[LOC]
export function buildApp(callback: (app: Express, err?: Error) => void): void {
  // API keys and Passport configuration
  // TODO: set up passport

  const app: Express = expressSetup();

  middlewareSetup(app);

  devMiddlewareSetup(app);

  // Routes set up
  app.use("/", TestRouter());

  // Connecting to database
  createConnection({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
      __dirname + "/db/entity/*.ts"
    ],
    synchronize: true,
    logging: false
  }).then((connection: Connection) => {
    console.log("  Connection to database established.");
    console.log(process.env.DB_HOST);
    return callback(app);
  }).catch((err: Error) => {
    console.error("Could not connect to database");
    console.log(err);
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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
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