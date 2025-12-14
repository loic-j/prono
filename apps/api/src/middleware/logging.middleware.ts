import { Context, Next } from "hono";
import { logger } from "../utils/logger";
import { trace, context as otelContext, propagation } from "@opentelemetry/api";
import { ApplicationError } from "../domain/errors";

/**
 * Logging middleware that:
 * 1. Extracts trace context from incoming requests (for distributed tracing)
 * 2. Logs incoming requests with trace correlation
 * 3. Logs outgoing responses with duration
 * 4. Automatically propagates trace context
 */
export async function loggingMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const { method, url } = c.req;

  // Extract trace context from incoming request headers (W3C Trace Context)
  const extractedContext = propagation.extract(
    otelContext.active(),
    c.req.raw.headers
  );

  // Create a new span for this request
  const tracer = trace.getTracer("prono-api");

  return otelContext.with(extractedContext, async () => {
    const span = tracer.startSpan(`HTTP ${method} ${new URL(url).pathname}`, {
      attributes: {
        "http.method": method,
        "http.url": url,
        "http.target": new URL(url).pathname,
      },
    });

    return otelContext.with(
      trace.setSpan(otelContext.active(), span),
      async () => {
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

          // Add response attributes to span
          span.setAttribute("http.status_code", c.res.status);
          span.setAttribute("http.response_time_ms", duration);

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

          // Set span status based on HTTP status code
          if (c.res.status >= 400) {
            span.setStatus({
              code: c.res.status >= 500 ? 2 : 1, // ERROR : OK
              message: `HTTP ${c.res.status}`,
            });
          }
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

          // Set span status to error
          span.setStatus({
            code: 2, // ERROR
            message: error instanceof Error ? error.message : "Unknown error",
          });

          span.recordException(error as Error);

          throw error;
        } finally {
          span.end();
        }
      }
    );
  });
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
