import { buildApp } from "./app";
import { Express } from "express";
import { createConnection, Connection } from "typeorm";


/**
 * Start Express server.
 */
buildApp((app: Express) => {
  app.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });
});