import * as crypto from "crypto";

/**
 * Generates a random token for the hardware item reservation
 * @param tokenLength The length of random string to produce (default is 10)
 */
export const createToken = (tokenLength?: number): string => {
  return crypto.randomBytes(tokenLength !== undefined ? tokenLength : 10).toString("hex");
};