import { buildApp } from "./app";
import { Express } from "express";
import { Server } from "http";
import * as socketIO from "socket.io";

/**
 * Start Express server.
 */
buildApp((app: Express, err: Error) : socketIO.Server => {
  if (err) {
    console.error("Could not start server!");
  } else {
    const server = new Server(app);
    const io = socketIO(server);
    server.listen(app.get("port"), () => {
      console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });
    return io;
  }
});
