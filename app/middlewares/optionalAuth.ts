
import DB from "../services/DB";
import { Request, Response } from "../../type";

/**
 * Optional Auth Middleware
 * Sets user data if authenticated, but doesn't redirect if not
 * Used for routes that work for both authenticated and guest users
 */
export default async (request: Request, response: Response) => {
    if (request.cookies.auth_id) {
        const session = await DB.from("sessions").where("id", request.cookies.auth_id).first();

        if (session) {
            const user = await DB.from("users")
                .where("id", session.user_id)
                .select(["id", "name", "email", "phone", "is_admin", "is_verified"])
                .first();

            request.user = user;
            request.share = {
                "user": request.user,
            };
        }
    }
    // Don't redirect if not authenticated - just continue
}
