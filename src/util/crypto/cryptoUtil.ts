import { v4 } from "uuid";
import { createHmac } from "crypto";

/**
 * Generates a uuid token for the hardware item reservation
 */
export const createToken = (): string => {
  return v4();
};

export const genHmac = (value: string): string => {
  return createHmac("sha256", process.env.DISCORD_HMAC_KEY)
    .update(value)
    .digest("base64");
}
