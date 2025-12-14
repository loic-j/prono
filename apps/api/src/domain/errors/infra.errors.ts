import { InternalServerError, ServiceUnavailableError } from "./http.errors";

/**
 * Infrastructure-specific errors
 */

/**
 * Thrown when database operations fail
 */
export class DatabaseError extends InternalServerError {
  code = "DATABASE_ERROR";

  constructor(
    message: string = "Database operation failed",
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

/**
 * Thrown when external service (like SuperTokens) fails
 */
export class ExternalServiceError extends ServiceUnavailableError {
  code = "EXTERNAL_SERVICE_ERROR";

  constructor(
    serviceName: string,
    message?: string,
    context?: Record<string, any>
  ) {
    super(message || `External service '${serviceName}' is unavailable`, {
      ...context,
      serviceName,
    });
  }
}

/**
 * Thrown when SuperTokens service fails
 */
export class SuperTokensError extends ExternalServiceError {
  code = "SUPERTOKENS_ERROR";

  constructor(message?: string, context?: Record<string, any>) {
    super("SuperTokens", message, context);
  }
}
