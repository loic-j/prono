/**
 * Base application error class
 * All custom errors should extend this class
 */
export abstract class ApplicationError extends Error {
  /**
   * HTTP status code associated with this error
   */
  abstract readonly statusCode: number;

  /**
   * Error code for API clients to handle specific errors programmatically
   */
  abstract readonly code: string;

  /**
   * Whether this error should be logged as an error or just as info/warning
   * Some errors like validation errors or not found errors are expected and don't need error-level logging
   */
  readonly isOperational: boolean = true;

  /**
   * Additional context data that can be included in the error response or logs
   */
  readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a JSON-serializable object for API responses
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.context && { context: this.context }),
    };
  }
}

/**
 * Base class for 400-level errors (client errors)
 */
export abstract class ClientError extends ApplicationError {
  readonly isOperational = true;
}

/**
 * Base class for 500-level errors (server errors)
 */
export abstract class ServerError extends ApplicationError {
  readonly isOperational = false;
}
