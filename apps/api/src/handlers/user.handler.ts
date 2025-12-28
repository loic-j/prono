/**
 * User Registration Handler
 *
 * Demonstrates how to use dependency injection to access use cases
 */

import { Context } from "hono";

/**
 * Register user handler using DI
 * Shows how to get use cases from the container
 */
export const registerUserHandler = async (c: any) => {
  // Get validated data from middleware
  const { email, password } = c.req.valid("json");

  // Get use case from DI container
  const container = c.get("container");
  const { registerUser } = container.useCases;

  // Execute use case - let errors bubble up to Hono error handler
  const user = await registerUser.execute(email, password);

  return c.json(
    {
      id: user.id,
      email: user.email,
      message: "User registered successfully",
    },
    201
  );
};

/**
 * Update user profile handler using DI
 */
export const updateUserProfileHandler = async (c: any) => {
  const session = c.get("session");

  if (!session) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const userId = session.getUserId();

  // Get validated data from middleware
  const { displayName } = c.req.valid("json");

  // Get use case from DI container
  const container = c.get("container");
  const { updateUserProfile } = container.useCases;

  // Execute use case
  const user = await updateUserProfile.execute(userId, { displayName });

  return c.json(
    {
      id: user.id,
      email: user.email,
      displayName: user.getDisplayName(),
      message: "Profile updated successfully",
    },
    200
  );
};
