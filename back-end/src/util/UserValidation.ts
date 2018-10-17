import { getRepository, getConnection } from "typeorm";
import { User } from "../db/entity/User";
import * as bcrypt from "bcrypt";

/**
 * Gets the password of the user that is linked to the provided email
 * @param submittedEmail email provided by the user, we search for it in the database
 */
async function getPassword(submittedEmail: string): Promise<string> {
    // getRepository implicitly gets the connection from the conneciton manager
    // We then create and execute a query to get the hashed password based on the provided email
    const user: User = await getConnection("hub")
    .getRepository(User)
    .createQueryBuilder("user")
    .select(
        "user.password"
    )
    .where("user.email = :email", { email: submittedEmail })
    .getOne();

    return user.password;
}

/**
 * We check that the password hash is valid
 * @param submittedPassword password provided by the user
 * @param hashedPassword Hashed password we have got from the database
 */
async function validatePassword(submittedPassword: string, hashedPassword: string): Promise<boolean> {
    // Finally, we check if the provided password was correct based on the hashed password from the database
    return await bcrypt.compare(submittedPassword, hashedPassword);
}

/**
 * This function takes validates a user based on the provided email and password.
 * It gets the database connection, gets the hashed password and validates the password using bcrypt
 * @param submittedEmail
 * @param submittedPassword
 *
 * @return true if user password is valid, false otherwise
 */
export async function validateUser(submittedEmail: string, submittedPassword: string): Promise<boolean> {
    const passwordFromDatabase = await getPassword(submittedEmail);
    if (passwordFromDatabase) {
        return await validatePassword(submittedPassword, passwordFromDatabase);
    }
}