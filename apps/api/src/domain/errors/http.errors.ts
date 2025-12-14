import { ClientError, ServerError } from "./base.error";

/**
 * 400 Bad Request - The request is malformed or invalid
 */
export class BadRequestError extends ClientError {
  readonly statusCode = 400;
  code = "BAD_REQUEST";

  constructor(message: string = "Bad request", context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * 401 Unauthorized - Authentication is required or failed
 */
export class UnauthorizedError extends ClientError {
  readonly statusCode = 401;
  code = "UNAUTHORIZED";

  constructor(
    message: string = "Authentication required",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * 403 Forbidden - The user is authenticated but doesn't have permission
 */
export class ForbiddenError extends ClientError {
  readonly statusCode = 403;
  code = "FORBIDDEN";

  constructor(
    message: string = "Access forbidden",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * 404 Not Found - The requested resource doesn't exist
 */
export class NotFoundError extends ClientError {
  readonly statusCode = 404;
  code = "NOT_FOUND";

  constructor(
    message: string = "Resource not found",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * 409 Conflict - The request conflicts with the current state
 */
export class ConflictError extends ClientError {
  readonly statusCode = 409;
  code = "CONFLICT";

  constructor(message: string = "Conflict", context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends ClientError {
  readonly statusCode = 422;
  code = "VALIDATION_ERROR";

  constructor(
    message: string = "Validation failed",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * 500 Internal Server Error - Generic server error
 */
export class InternalServerError extends ServerError {
  readonly statusCode = 500;
  code = "INTERNAL_SERVER_ERROR";

  constructor(
    message: string = "Internal server error",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * 503 Service Unavailable - External dependency is unavailable
 */
export class ServiceUnavailableError extends ServerError {
  readonly statusCode = 503;
  code = "SERVICE_UNAVAILABLE";

  constructor(
    message: string = "Service temporarily unavailable",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}
