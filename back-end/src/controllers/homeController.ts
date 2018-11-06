import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/errorHandling/apiError";
import { HttpResponseCode } from "../util/errorHandling/httpResponseCode";
import { getConnection } from "typeorm";
import { Event } from "../db/entity";
import { Cache } from "../util/cache";

/**
 * A controller for auth methods
 */
export class HomeController {
  public login(req: Request, res: Response, next: NextFunction) {
    res.render("pages/index");
  }
}