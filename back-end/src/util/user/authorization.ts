import { Request, Response, NextFunction } from "express";
import { AuthLevels } from "./authLevels";
import { User } from "../../db/entity";
import { ApiError } from "../errorHandling/apiError";
import { HttpResponseCode } from "../errorHandling/httpResponseCode";

/**
 * Checks if the request's sender is logged in
 * @param req The request
 * @param res The response
 * @param next The next handler
 */
export const checkIsLoggedIn = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return res.redirect("/login");
    // return next(new ApiError(HttpResponseCode.FORBIDDEN, "You are not logged in!"));
  }
  return next();
};

/**
 * Checks if the request's sender is logged in
 * and has the authorization level of at least a volunteer
 * @param req The request
 * @param res The response
 * @param next The next handler
 */
export const checkIsVolunteer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user as User).authLevel < AuthLevels.Volunteer) {
    return next(new ApiError(HttpResponseCode.FORBIDDEN, "You are not logged in or you are not a volunteer!"));
  }
  return next();
};

/**
 * Checks if the request's sender is logged in
 * and has the authorization level of at least an organizer
 * @param req The request
 * @param res The response
 * @param next The next handler
 */
export const checkIsOrganizer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user as User).authLevel < AuthLevels.Organizer) {
    return next(new ApiError(HttpResponseCode.FORBIDDEN, "You are not logged in or you are not not an organizer!"));
  }
  return next();
};