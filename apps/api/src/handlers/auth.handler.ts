import { Context } from "hono";
import { logger } from "../utils/logger";
import {
  InvalidSessionError,
  UserNotFoundError,
  SuperTokensError,
} from "../domain/errors";

/**
 * Get current user handler
 * Returns the currently authenticated user's information
 */
export const getCurrentUserHandler = async (c: any) => {
  const session = c.get("session");
  const container = c.get("container");

  if (!session) {
    throw new InvalidSessionError("Not authenticated");
  }

  const user = await container.infra.authService.getUserById(
    session.getUserId()
  );

  if (!user) {
    throw new UserNotFoundError(
      session.getUserId(),
      "Authenticated user not found"
    );
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
};

/**
 * Sign out handler
 * Signs out the current user by revoking their session
 */
export const signOutHandler = async (c: any) => {
  const session = c.get("session");

  if (!session) {
    throw new InvalidSessionError("Not authenticated");
  }

  try {
    await session.revokeSession();

    return c.json(
      {
        message: "Signed out successfully",
      },
      200
    );
  } catch (error: any) {
    logger.error({ error }, "Error revoking session");
    throw new SuperTokensError("Failed to sign out", {
      originalError: error.message,
    });
  }
};
