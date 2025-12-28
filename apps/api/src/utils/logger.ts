import pino from "pino";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

/**
 * Create a production-ready logger with OpenTelemetry trace context
 *
 * Works seamlessly with @hono/otel for automatic trace context injection
 */
function createLogger() {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return pino({
    level: process.env.LOG_LEVEL || "info",
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    // In development, use pretty printing for readability
    transport: isDevelopment
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
    // Base fields included in every log
    base: {
      service: process.env.OTEL_SERVICE_NAME || "prono-api",
      environment: process.env.NODE_ENV || "development",
    },
  });
}

const baseLogger = createLogger();

/**
 * Logger with automatic trace context injection
 * This function returns a logger that automatically includes:
 * - trace_id: Current OpenTelemetry trace ID
 * - span_id: Current OpenTelemetry span ID
 * - trace_flags: Sampling decision
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.info({ userId: '123' }, 'User logged in');
 * logger.error({ error: err }, 'Failed to process request');
 * ```
 */
export const logger = new Proxy(baseLogger, {
  get(target, prop) {
    // For logging methods, inject trace context
    if (
      typeof prop === "string" &&
      ["trace", "debug", "info", "warn", "error", "fatal"].includes(prop)
    ) {
      return (...args: any[]) => {
        const traceContext = getTraceContext();
        const method = target[prop as keyof typeof target] as any;

        // If first argument is an object (structured logging), merge trace context
        if (typeof args[0] === "object" && args[0] !== null) {
          args[0] = { ...traceContext, ...args[0] };
        } else {
          // Otherwise, prepend trace context as first argument
          args.unshift(traceContext);
        }

        return method.apply(target, args);
      };
    }

    // For other methods/properties, return as-is
    return (target as any)[prop];
  },
});

/**
 * Get current OpenTelemetry trace context
 */
function getTraceContext() {
  const span = trace.getSpan(context.active());

  if (!span) {
    return {};
  }

  const spanContext = span.spanContext();

  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    trace_flags: `0${spanContext.traceFlags.toString(16)}`,
  };
}

/**
 * Utility to create a child logger with additional context
 * Useful for adding request-specific or user-specific context
 *
 * Usage:
 * ```typescript
 * const reqLogger = createChildLogger({ requestId: req.id, userId: user.id });
 * reqLogger.info('Processing request');
 * ```
 */
export function createChildLogger(bindings: Record<string, any>) {
  return baseLogger.child(bindings);
}

/**
 * Utility to wrap async operations with automatic error logging and span status
 *
 * Creates a child span for the operation, useful for tracing specific operations
 * within a request. @hono/otel manages the parent span automatically.
 *
 * Usage:
 * ```typescript
 * await withLogging('database-query', async () => {
 *   return await db.query(...);
 * });
 * ```
 */
export async function withLogging<T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const tracer = trace.getTracer("prono-api");
  const span = tracer.startSpan(operationName);

  try {
    logger.debug({ operation: operationName, ...context }, "Operation started");
    const result = await operation();
    span.setStatus({ code: SpanStatusCode.OK });
    logger.debug(
      { operation: operationName, ...context },
      "Operation completed"
    );
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    logger.error(
      { operation: operationName, error, ...context },
      "Operation failed"
    );
    throw error;
  } finally {
    span.end();
  }
}

export default logger;
