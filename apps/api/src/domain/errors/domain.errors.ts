import { UnauthorizedError, NotFoundError, ConflictError } from "./http.errors";

/**
 * Domain-specific errors for authentication and authorization
 */

/**
 * Thrown when authentication fails or is required
 */
export class AuthenticationFailedError extends UnauthorizedError {
  code = "AUTHENTICATION_FAILED";

  constructor(
    message: string = "Authentication failed",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * Thrown when session is invalid or expired
 */
export class InvalidSessionError extends UnauthorizedError {
  code = "INVALID_SESSION";

  constructor(
    message: string = "Session is invalid or expired",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * Thrown when session needs to be refreshed
 */
export class SessionRefreshRequiredError extends UnauthorizedError {
  code = "SESSION_REFRESH_REQUIRED";

  constructor(
    message: string = "Session refresh required",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * Domain-specific errors for user operations
 */

/**
 * Thrown when a user is not found
 */
export class UserNotFoundError extends NotFoundError {
  code = "USER_NOT_FOUND";

  constructor(
    userId?: string,
    message: string = "User not found",
    context?: Record<string, any>
  ) {
    super(message, { ...context, userId });
  }
}

/**
 * Thrown when a user already exists (e.g., duplicate email)
 */
export class UserAlreadyExistsError extends ConflictError {
  code = "USER_ALREADY_EXISTS";

  constructor(
    message: string = "User already exists",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}
