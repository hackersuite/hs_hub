import { Request, Response } from "express";

import { validateUser } from "../util/UserValidation";

/**
 * A controller for handling user logins
 */
export class LoginController {

  /**
   * Check if the current user exists in the database
   *
   * @param req
   * @param res
   */
  public async login(req: Request, res: Response): Promise<void> {
    const email: string = req.body.email;
    const password: string = req.body.password;

    try {
      const valid = await validateUser(email, password);

      if (valid) {
        res.send({
          "status": 200,
          "text": "valid"
        });
      } else {
        res.send({
          "status": 401,
          "text": "invalid"
        });
      }
    } catch (err) {
      console.log("Error occured");
    }
  }
}