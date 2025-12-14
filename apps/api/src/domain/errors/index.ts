/**
 * Central export for all error types
 * Import errors from this file to maintain clean imports
 */

// Base errors
export { ApplicationError, ClientError, ServerError } from "./base.error";

// HTTP errors
export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
} from "./http.errors";

// Domain errors
export {
  AuthenticationFailedError,
  InvalidSessionError,
  SessionRefreshRequiredError,
  UserNotFoundError,
  UserAlreadyExistsError,
} from "./domain.errors";

// Infrastructure errors
export {
  DatabaseError,
  ExternalServiceError,
  SuperTokensError,
} from "./infra.errors";

// Error factories (optional - for convenience)
export {
  ErrorFactory,
  ValidationErrorFactory,
  NotFoundErrorFactory,
  AuthErrorFactory,
  ConflictErrorFactory,
  BadRequestErrorFactory,
} from "./factories";
