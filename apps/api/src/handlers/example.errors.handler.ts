import { Context } from "hono";
import { ErrorFactory, ValidationError } from "../domain/errors";

/**
 * Example handler demonstrating proper error handling
 *
 * This handler shows how to:
 * - Use zValidator middleware for automatic validation
 * - Apply custom business logic validation
 * - Throw custom validation errors
 * - Let errors bubble up to Hono's error handler
 *
 * Note: Basic validation (required, type, format) is handled by zValidator middleware
 * This handler focuses on custom business logic validation
 */
export const exampleValidationHandler = async (c: any) => {
  // Get validated data from zValidator middleware
  const { email, age, role } = c.req.valid("json");

  // Custom business logic validation
  // (Basic validation like required, email format, number range is done by zValidator)
  if (email.endsWith("@blocked-domain.com")) {
    throw new ValidationError("This email domain is not allowed", {
      email,
      reason: "blocked_domain",
    });
  }

  // If all validations pass, return success
  return c.json({
    message: "Validation successful",
    data: { email, age, role },
  });
};

/**
 * Example handler demonstrating auth error handling
 */
export const exampleAuthCheckHandler = async (c: Context) => {
  const userId = c.get("userId");

  if (!userId) {
    throw ErrorFactory.auth.notAuthenticated();
  }

  const user = c.get("user");

  // Check if user has admin role (example)
  if (user.role !== "admin") {
    throw ErrorFactory.auth.insufficientPermissions(
      "admin resources",
      "access"
    );
  }

  return c.json({
    message: "Admin access granted",
    user: {
      id: user.id,
      email: user.email,
    },
  });
};
