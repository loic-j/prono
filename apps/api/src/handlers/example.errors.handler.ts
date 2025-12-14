import { Context } from "hono";
import { ErrorFactory, ValidationError } from "../domain/errors";

/**
 * Example handler demonstrating proper error handling
 *
 * This handler shows how to:
 * - Use error factories for common scenarios
 * - Throw custom validation errors
 * - Let errors bubble up to Hono's error handler
 */
export const exampleValidationHandler = async (c: Context) => {
  // Parse request body
  const body = await c.req.json().catch(() => {
    throw ErrorFactory.badRequest.malformedBody("Invalid JSON");
  });

  const { email, age, role } = body;

  // Validation using error factories
  if (!email) {
    throw ErrorFactory.validation.required("email");
  }

  if (!email.includes("@")) {
    throw ErrorFactory.validation.invalidFormat("email", "valid email address");
  }

  if (!age) {
    throw ErrorFactory.validation.required("age");
  }

  if (typeof age !== "number" || age < 18 || age > 120) {
    throw ErrorFactory.validation.outOfRange("age", 18, 120, age);
  }

  if (role && !["admin", "user", "guest"].includes(role)) {
    throw ErrorFactory.validation.invalidEnum("role", [
      "admin",
      "user",
      "guest",
    ]);
  }

  // Custom validation error
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
