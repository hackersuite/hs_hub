import "reflect-metadata";
import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as morgan from "morgan";
import * as errorHandler from "errorhandler";
import { Request, Response, NextFunction } from "express";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Routers
import { TestRouter } from "./routes";

// API keys and Passport configuration
// TODO: set up passport

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("env", process.env.ENVIRONMENT || "production");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);


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

// Routes set up
app.use("/", TestRouter());

export default app;