import { Context, Next } from "hono";
import { logger } from "../utils/logger";
import { trace, context as otelContext, propagation } from "@opentelemetry/api";

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
 */
export function errorLoggingMiddleware(error: Error, c: Context) {
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

  return c.json(
    {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    },
    500
  );
}
