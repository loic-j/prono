import { HelloResponseSchema } from "@prono/types";
import { z } from "zod";
import { Context } from "hono";
import { AuthenticatedContext } from "../types/context.types";
import { logger, withLogging } from "../utils/logger";

type HelloResponse = z.infer<typeof HelloResponseSchema>;

/**
 * Simple hello world handler
 * Returns a basic greeting message
 */
export const helloHandler = (c: any) => {
  const response: HelloResponse = {
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  };

  return c.json(response, 200);
};

/**
 * Personalized greeting handler (PROTECTED)
 * Returns a greeting message using the authenticated user's name
 *
 * This endpoint is protected and requires authentication
 * It will greet the user with their display name from their profile
 */
export const helloNameHandler = async (
  c: Context<{ Variables: Partial<AuthenticatedContext> }>
) => {
  try {
    // Get the user object from context (set by authMiddleware)
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          error: "Not authenticated",
          message: "User authentication is required to access this resource",
        },
        401
      );
    }

    // Use the user's display name directly from the context
    const displayName = user.getDisplayName();

    const response: HelloResponse = {
      message: `Hello ${displayName}! Welcome back.`,
      timestamp: new Date().toISOString(),
    };

    return c.json(response, 200);
  } catch (error) {
    logger.error({ error }, "Error in helloNameHandler");
    return c.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
      },
      500
    );
  }
};
