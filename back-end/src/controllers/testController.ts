import { Request, Response } from "express";
import { log } from "util";

/**
 * A template controller
 */
export class TestController {
  /**
   * Says hellow
   */
  public index(req: Request, res: Response): void {
    res.send("hellow");
  }

  /**
   * Prints the user's name provided in URL parameters
   */
  public name(req: Request, res: Response): void {
    res.send(req.params.name);
  }

  /**
   * Prints the user's password provided in the request's body
   */
  public password(req: Request, res: Response): void {
    res.send(req.body.password);
  }

  /**
   * Prints the user's email provided in the request's query parameters
   */
  public email(req: Request, res: Response): void {
    res.send(req.query.email);
  }
}