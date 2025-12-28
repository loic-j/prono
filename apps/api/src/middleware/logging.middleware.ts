import { Context, Next } from "hono";
import { logger } from "../utils/logger";
import { ApplicationError } from "../domain/errors";

/**
 * Logging middleware for request/response logging
 *
 * Note: Trace context is automatically managed by @hono/otel middleware
 * This middleware focuses on application-level logging
 */
export async function loggingMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const { method, url } = c.req;

  try {
    // Log incoming request
    logger.info(
      {
        type: "request",
        method,
        url,
        user_agent: c.req.header("user-agent"),
      },
      "Incoming request"
    );

    // Process request
    await next();

    // Calculate duration
    const duration = Date.now() - startTime;

    // Log outgoing response
    logger.info(
      {
        type: "response",
        method,
        url,
        status: c.res.status,
        duration_ms: duration,
      },
      "Request completed"
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error
    logger.error(
      {
        type: "error",
        method,
        url,
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: duration,
      },
      "Request failed"
    );

    throw error;
  }
}

/**
 * Error handling middleware that logs errors with trace context
 * Parses ApplicationError instances and returns appropriate HTTP responses
 */
export function errorLoggingMiddleware(error: Error, c: Context) {
  // Check if it's one of our custom application errors
  if (error instanceof ApplicationError) {
    // Log based on error type - operational errors are logged as warnings, others as errors
    const logMethod = error.isOperational ? logger.warn : logger.error;

    logMethod(
      {
        type: "application_error",
        error: {
          name: error.name,
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          context: error.context,
          stack:
            process.env.NODE_ENV === "production" ? undefined : error.stack,
        },
        method: c.req.method,
        url: c.req.url,
      },
      `Application error: ${error.code}`
    );

    // Return structured error response
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.context &&
            process.env.NODE_ENV !== "production" && {
              context: error.context,
            }),
        },
      },
      error.statusCode as any
    );
  }

  // Unknown/unhandled errors - log as critical errors
  logger.error(
    {
      type: "unhandled_error",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      method: c.req.method,
      url: c.req.url,
    },
    "Unhandled error"
  );

  // Return generic error response for unknown errors
  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : error.message,
      },
    },
    500
  );
}
