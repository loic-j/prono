import { HelloResponseSchema, HelloNameParamSchema } from "@prono/types";
import { z } from "zod";
import { authService } from "../infra/supertokens";

type HelloResponse = z.infer<typeof HelloResponseSchema>;
type HelloNameParam = z.infer<typeof HelloNameParamSchema>;

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
export const helloNameHandler = async (c: any) => {
  try {
    // Get the user ID from the session (set by authMiddleware)
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    // Get user information from the auth service
    const user = await authService.getUserById(userId);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Use the user's display name instead of the path parameter
    const displayName = user.getDisplayName();

    const response: HelloResponse = {
      message: `Hello ${displayName}! Welcome back.`,
      timestamp: new Date().toISOString(),
    };

    return c.json(response, 200);
  } catch (error) {
    console.error("Error in helloNameHandler:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
