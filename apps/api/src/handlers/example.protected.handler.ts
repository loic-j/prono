import { Context } from "hono";
import { AuthenticatedContext } from "../types/context.types";

/**
 * Example protected handler showing how to use type-safe authenticated context
 *
 * This demonstrates accessing user information with full TypeScript support
 */
export const exampleProtectedHandler = async (
  c: Context<{ Variables: AuthenticatedContext }>
) => {
  // With type safety, you get autocomplete and type checking for these:
  const user = c.get("user"); // User entity with all methods
  const userId = c.get("userId"); // string
  const session = c.get("session"); // SessionContainer

  // Access user information with type safety
  return c.json({
    userId: user?.id,
    email: user?.email,
    displayName: user?.getDisplayName(),
    isVerified: user?.isVerified(),
    timeJoined: user?.timeJoined,
    metadata: user?.metadata,
  });
};
