import { getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";

/**
 * This function takes validates a user based on the provided email and password.
 * It gets the database connection, gets the hashed password and validates the password using bcrypt
 * @param submittedEmail
 * @param submittedPassword
 *
 * @return true if user password is valid, false otherwise
 */
export async function validateUser(submittedEmail: string, submittedPassword: string): Promise<boolean> {

    // getRepository implicitly gets the connection from the conneciton manager
    // We then create and execute a query to get the hashed password based on the provided email
    const user: User = await getRepository(User)
    .createQueryBuilder("user")
    .select(
        "user.password"
    )
    .where("user.email = :email", { email: submittedEmail })
    .getOne();

    if (user) {
        // Finally, we check if the provided password was correct based on the hashed password from the database
        return await bcrypt.compare(submittedPassword, user.password);
    } else {
        // Return false if the user was not found in the database
        return false;
    }
}