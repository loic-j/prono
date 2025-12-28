# Logging and OpenTelemetry with @hono/otel

This document describes the logging and distributed tracing infrastructure using **@hono/otel** in the Prono API.

## Overview

The application uses:
- **@hono/otel** for automatic OpenTelemetry instrumentation of Hono applications
- **Pino** for structured, high-performance logging
- **OpenTelemetry** for distributed tracing and observability
- Automatic trace context propagation across all requests
- Correlation between logs and traces via trace IDs

## Features

### ✅ Automatic Request Tracing with @hono/otel
- Automatic span creation for every HTTP request
- W3C Trace Context propagation (traceparent/tracestate headers)
- HTTP metadata automatically attached to spans (method, URL, status code, duration)
- Zero-configuration distributed tracing

### ✅ Automatic Trace Context in Logs
Every log automatically includes:
- `trace_id`: Current OpenTelemetry trace ID
- `span_id`: Current OpenTelemetry span ID
- `trace_flags`: Trace sampling decision

### ✅ Structured Logging
All logs are in JSON format (production) or pretty-printed (development) with:
- Service name and environment
- Timestamp
- Log level
- Trace correlation
- Custom metadata

### ✅ Request/Response Logging
Every HTTP request is automatically logged with:
- HTTP method, URL, user agent
- Response status code
- Request duration in milliseconds
- Trace correlation

## Usage

### Basic Logging

```typescript
import { logger } from '@/utils/logger';

// Simple message
logger.info('User logged in');

// With structured data
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Different log levels
logger.debug('Debug message');
logger.info('Info message');
logger.warn({ field: 'value' }, 'Warning message');
logger.error({ error: err }, 'Error occurred');
logger.fatal('Fatal error');
```

### Child Logger

Create a child logger with additional context:

```typescript
import { createChildLogger } from '@/utils/logger';

const requestLogger = createChildLogger({
  requestId: req.id,
  userId: user.id,
});

requestLogger.info('Processing request');
// All logs from this logger will include requestId and userId
```

### Wrapped Operations

Automatically log and trace operations:

```typescript
import { withLogging } from '@/utils/logger';

const result = await withLogging(
  'database-query',
  async () => {
    return await db.users.findUnique({ where: { id: userId } });
  },
  { userId } // Additional context
);
```

This will:
- Create a child OpenTelemetry span
- Log operation start and completion
- Log errors with trace context
- Set span status based on success/failure

## Configuration

### Environment Variables

```bash
# Logger
LOG_LEVEL=info                          # debug, info, warn, error, fatal
NODE_ENV=production                     # development, production

# OpenTelemetry
OTEL_SERVICE_NAME=prono-api            # Service name for tracing
SERVICE_VERSION=1.0.0                   # Service version
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces  # OTLP endpoint
```

### Development vs Production

**Development:**
- Logs are pretty-printed with colors
- Human-readable timestamp format
- More verbose output

**Production:**
- Logs are in JSON format
- Optimized for log aggregation systems
- Suitable for Elasticsearch, Splunk, etc.

## OpenTelemetry Setup with @hono/otel

### Initialize Telemetry

Telemetry is automatically initialized in [index.ts](apps/api/src/index.ts#L1-L5) **before any other imports**.

This is critical for auto-instrumentation to work properly.

### Apply @hono/otel Instrumentation

In [app.ts](apps/api/src/app.ts), the `httpInstrumentationMiddleware` is applied:

```typescript
import { httpInstrumentationMiddleware } from "@hono/otel";

const app = new OpenAPIHono<AppContext>();

// Apply @hono/otel instrumentation for automatic tracing
app.use("*", httpInstrumentationMiddleware());
```

This automatically:
- Creates spans for all incoming HTTP requests
- Extracts trace context from `traceparent` and `tracestate` headers
- Propagates trace context to downstream operations
- Adds HTTP semantic conventions to spans (method, URL, status code, etc.)
- Sets span status based on response codes

### What @hono/otel Handles Automatically

**✅ HTTP Request Tracing:**
- Span creation for each request
- Span naming: `HTTP ${method} ${path}`
- HTTP attributes: method, URL, status code, etc.

**✅ Trace Context Propagation:**
- Extracts W3C Trace Context from headers
- Makes context available to all downstream code
- Automatically propagates to child spans

**✅ Error Handling:**
- Sets span status to ERROR on exceptions
- Records exception details in span

### Manual Span Creation

While @hono/otel handles request-level spans, you can create child spans for specific operations:

```typescript
import { withLogging } from '@/utils/logger';

// Creates a child span within the current request span
await withLogging('database-operation', async () => {
  // Your code here
});
```

### OTLP Exporter

Traces are exported via OTLP (OpenTelemetry Protocol) to the configured endpoint.

**Compatible with:**
- Jaeger (set endpoint to `http://localhost:4318/v1/traces`)
- Grafana Tempo
- Honeycomb
- New Relic
- Datadog
- Any OTLP-compatible backend

## Testing Locally with Jaeger

To visualize traces locally:

```bash
# Start Jaeger with Docker
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Run your API
pnpm dev

# View traces at http://localhost:16686
```

## Example Log Output

**Development (pretty-printed):**
```
[14:32:01 PST] INFO: Incoming request
    trace_id: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    span_id: "1234567890abcdef"
    type: "request"
    method: "GET"
    url: "/api/users/123"
    user_agent: "Mozilla/5.0..."

[14:32:01 PST] INFO: Request completed
    trace_id: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    span_id: "1234567890abcdef"
    type: "response"
    status: 200
    duration_ms: 45
```

**Production (JSON):**
```json
{
  "level": "INFO",
  "time": 1702578721000,
  "service": "prono-api",
  "environment": "production",
  "trace_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "span_id": "1234567890abcdef",
  "type": "request",
  "method": "GET",
  "url": "/api/users/123",
  "msg": "Incoming request"
}
```

## Architecture

```
index.ts
  └─> Initialize OpenTelemetry (MUST BE FIRST)
  └─> Import app
  └─> Start server

app.ts
  └─> Apply @hono/otel instrumentation
  └─> Add logging middleware (logs requests/responses)
  └─> Add CORS middleware (includes trace headers)
  └─> Add routes
  └─> Add error logging middleware

Any handler/service
  └─> Import logger
  └─> Logger automatically includes trace context
  └─> Traces automatically propagate
```

### Key Components

1. **[@hono/otel](https://github.com/honojs/middleware/tree/main/packages/otel)** - Hono middleware for automatic OpenTelemetry instrumentation
   - Handles span creation and management
   - Extracts and propagates W3C Trace Context
   - Adds HTTP semantic conventions

2. **[Pino Logger](apps/api/src/utils/logger.ts)** - Structured logging with trace context
   - Automatically injects trace_id and span_id into all logs
   - Uses OpenTelemetry API to get current context

3. **[Logging Middleware](apps/api/src/middleware/logging.middleware.ts)** - Application-level logging
   - Logs incoming requests and responses
   - Measures request duration
   - Complements @hono/otel's tracing

4. **[Telemetry Setup](apps/api/src/infra/telemetry/tracer.ts)** - OpenTelemetry SDK configuration
   - Configures OTLP exporter
   - Sets up service resource attributes
   - Manages SDK lifecycle

## Benefits of @hono/otel

### Before @hono/otel (Manual Approach)
- Manual span creation in middleware
- Manual trace context extraction
- Manual HTTP attributes attachment
- Manual error handling and span status management
- More code to maintain

### After @hono/otel (Automatic)
- ✅ Single line: `app.use("*", httpInstrumentationMiddleware())`
- ✅ Automatic span creation for all routes
- ✅ Automatic trace context propagation
- ✅ Automatic HTTP semantic conventions
- ✅ Automatic error handling
- ✅ Less boilerplate, more consistent

## Best Practices

### ✅ DO
- Use structured logging with objects
- Include relevant context (userId, requestId, etc.)
- Use appropriate log levels
- Let the logger inject trace context automatically
- Use `withLogging` for critical operations
- Apply `httpInstrumentationMiddleware()` early in app setup (before other middleware)

### ❌ DON'T
- Use `console.log` - always use `logger`
- Log sensitive data (passwords, tokens, PII)
- Log in tight loops (degrades performance)
- Include trace_id manually (it's automatic)
- Create manual spans for HTTP requests (@hono/otel does this)

## Troubleshooting

### Logs don't show trace_id
- Ensure telemetry is initialized in [index.ts](apps/api/src/index.ts#L1-L5) **before** other imports
- Verify `httpInstrumentationMiddleware()` is applied in [app.ts](apps/api/src/app.ts)
- Check that the logger is using the OpenTelemetry API correctly

### Traces not appearing in backend
- Check `OTEL_EXPORTER_OTLP_ENDPOINT` is correct
- Verify the backend is running and accessible
- Check logs for OpenTelemetry export errors
- Ensure the OTLP endpoint accepts HTTP (not gRPC by default)

### Pretty printing not working in dev
- Ensure `NODE_ENV` is not set to `production`
- Verify `pino-pretty` is installed in devDependencies

### Spans not nested correctly
- Make sure you're using `withLogging` or OpenTelemetry context API correctly
- Verify that async context propagation is working (should be automatic with @hono/otel)

## Performance

- **@hono/otel** adds minimal overhead (~1-2ms per request)
- **Pino** is one of the fastest Node.js loggers (benchmarked)
- Structured logging has minimal overhead
- OpenTelemetry uses batched span export for efficiency
- Recommended for production use

## Migration from Manual Tracing

If migrating from manual OpenTelemetry instrumentation:

1. ✅ Remove manual span creation in middleware
2. ✅ Remove manual trace context extraction
3. ✅ Remove manual HTTP attribute setting
4. ✅ Add `app.use("*", httpInstrumentationMiddleware())` call
5. ✅ Keep logger as-is (works with @hono/otel)
6. ✅ Keep `withLogging` utility for manual spans

## Further Reading

- [@hono/otel Documentation](https://github.com/honojs/middleware/tree/main/packages/otel)
- [Pino Documentation](https://getpino.io/)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/instrumentation/js/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/http/)

