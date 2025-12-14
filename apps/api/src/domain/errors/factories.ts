/**
 * Error factory utilities for common error scenarios
 * These helpers make it easier to throw consistent errors across the application
 */

import {
  UserNotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "./index";

/**
 * Factory for creating validation errors with field-specific context
 */
export class ValidationErrorFactory {
  static required(field: string): ValidationError {
    return new ValidationError(`${field} is required`, { field });
  }

  static invalidFormat(
    field: string,
    expectedFormat?: string
  ): ValidationError {
    return new ValidationError(
      `${field} has invalid format${
        expectedFormat ? `: ${expectedFormat}` : ""
      }`,
      { field, expectedFormat }
    );
  }

  static tooShort(
    field: string,
    minLength: number,
    actualLength: number
  ): ValidationError {
    return new ValidationError(
      `${field} must be at least ${minLength} characters`,
      { field, minLength, actualLength }
    );
  }

  static tooLong(
    field: string,
    maxLength: number,
    actualLength: number
  ): ValidationError {
    return new ValidationError(
      `${field} must not exceed ${maxLength} characters`,
      { field, maxLength, actualLength }
    );
  }

  static outOfRange(
    field: string,
    min: number,
    max: number,
    actual: number
  ): ValidationError {
    return new ValidationError(`${field} must be between ${min} and ${max}`, {
      field,
      min,
      max,
      actual,
    });
  }

  static invalidEnum(field: string, allowedValues: string[]): ValidationError {
    return new ValidationError(
      `${field} must be one of: ${allowedValues.join(", ")}`,
      { field, allowedValues }
    );
  }
}

/**
 * Factory for resource not found errors
 */
export class NotFoundErrorFactory {
  static user(userId: string): UserNotFoundError {
    return new UserNotFoundError(userId);
  }

  static resource(resourceType: string, resourceId: string): ValidationError {
    return new ValidationError(`${resourceType} not found`, {
      resourceType,
      resourceId,
    });
  }
}

/**
 * Factory for authorization errors
 */
export class AuthErrorFactory {
  static notAuthenticated(): UnauthorizedError {
    return new UnauthorizedError("Authentication required");
  }

  static invalidCredentials(): UnauthorizedError {
    return new UnauthorizedError("Invalid credentials");
  }

  static insufficientPermissions(
    resource?: string,
    action?: string
  ): ForbiddenError {
    return new ForbiddenError(
      `Insufficient permissions${
        resource ? ` to ${action || "access"} ${resource}` : ""
      }`,
      { resource, action }
    );
  }

  static accountLocked(reason?: string): ForbiddenError {
    return new ForbiddenError(
      `Account is locked${reason ? `: ${reason}` : ""}`,
      { reason }
    );
  }
}

/**
 * Factory for conflict errors
 */
export class ConflictErrorFactory {
  static alreadyExists(
    resourceType: string,
    identifier: string
  ): ConflictError {
    return new ConflictError(`${resourceType} already exists`, {
      resourceType,
      identifier,
    });
  }

  static stateConflict(
    message: string,
    currentState: string,
    expectedState: string
  ): ConflictError {
    return new ConflictError(message, { currentState, expectedState });
  }
}

/**
 * Factory for bad request errors
 */
export class BadRequestErrorFactory {
  static missingHeader(headerName: string): BadRequestError {
    return new BadRequestError(`Missing required header: ${headerName}`, {
      headerName,
    });
  }

  static invalidContentType(actual: string, expected: string): BadRequestError {
    return new BadRequestError(
      `Invalid content type. Expected ${expected}, got ${actual}`,
      { actual, expected }
    );
  }

  static malformedBody(details?: string): BadRequestError {
    return new BadRequestError(
      `Malformed request body${details ? `: ${details}` : ""}`,
      { details }
    );
  }
}

/**
 * Export all factories as a single namespace for convenience
 */
export const ErrorFactory = {
  validation: ValidationErrorFactory,
  notFound: NotFoundErrorFactory,
  auth: AuthErrorFactory,
  conflict: ConflictErrorFactory,
  badRequest: BadRequestErrorFactory,
};
