import { Context } from "hono";
import { authService } from "../infra/supertokens";

/**
 * Get current user handler
 * Returns the currently authenticated user's information
 */
export const getCurrentUserHandler = async (c: any) => {
  try {
    const session = c.get("session");

    if (!session) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const user = await authService.getUserById(session.getUserId());

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(
      {
        id: user.id,
        email: user.email,
        displayName: user.getDisplayName(),
        timeJoined: user.timeJoined,
        isVerified: user.isVerified(),
      },
      200
    );
  } catch (error) {
    console.error("Error getting current user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

/**
 * Sign out handler
 * Signs out the current user by revoking their session
 */
export const signOutHandler = async (c: any) => {
  try {
    const session = c.get("session");

    if (!session) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    await session.revokeSession();

    return c.json(
      {
        message: "Signed out successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error signing out:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
