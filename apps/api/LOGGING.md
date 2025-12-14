# Logging and OpenTelemetry Infrastructure

This document describes the logging and distributed tracing infrastructure implemented in the Prono API.

## Overview

The application uses:
- **Pino** for structured, high-performance logging
- **OpenTelemetry** for distributed tracing and observability
- Automatic trace context propagation across all requests
- Correlation between logs and traces via trace IDs

## Features

### ✅ Automatic Trace Context Injection
Every log automatically includes:
- `trace_id`: Current OpenTelemetry trace ID
- `span_id`: Current OpenTelemetry span ID
- `trace_flags`: Trace sampling decision

### ✅ W3C Trace Context Propagation
The middleware automatically:
- Extracts trace context from incoming `traceparent` and `tracestate` headers
- Propagates traces across microservices
- Creates spans for each HTTP request

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
- Create an OpenTelemetry span
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

## OpenTelemetry Setup

### Initialize Telemetry

Telemetry is automatically initialized in [index.ts](apps/api/src/index.ts#L1-L3) **before any other imports**.

This is critical for auto-instrumentation to work properly.

### Auto-Instrumentation

The following are automatically instrumented:
- ✅ HTTP requests/responses
- ✅ Express (if used)
- ❌ DNS (disabled - too noisy)
- ❌ File system (disabled - too noisy)

### Trace Propagation

The [logging middleware](apps/api/src/middleware/logging.middleware.ts) automatically:
1. Extracts trace context from `traceparent` and `tracestate` headers
2. Creates a new span for the request
3. Propagates context to downstream operations
4. Adds HTTP metadata to spans

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
  └─> Add logging middleware (extracts & propagates traces)
  └─> Add CORS middleware (includes trace headers)
  └─> Add routes
  └─> Add error logging middleware

Any handler/service
  └─> Import logger
  └─> Logger automatically includes trace context
  └─> Traces automatically propagate
```

## Best Practices

### ✅ DO
- Use structured logging with objects
- Include relevant context (userId, requestId, etc.)
- Use appropriate log levels
- Let the logger inject trace context automatically
- Use `withLogging` for critical operations

### ❌ DON'T
- Use `console.log` - always use `logger`
- Log sensitive data (passwords, tokens, PII)
- Log in tight loops (degrades performance)
- Include trace_id manually (it's automatic)
- Override the logging middleware

## Troubleshooting

### Logs don't show trace_id
- Ensure telemetry is initialized in [index.ts](apps/api/src/index.ts#L1-L3) **before** other imports
- Verify logging middleware is registered in [app.ts](apps/api/src/app.ts)

### Traces not appearing in backend
- Check `OTEL_EXPORTER_OTLP_ENDPOINT` is correct
- Verify the backend is running and accessible
- Check logs for OpenTelemetry export errors

### Pretty printing not working in dev
- Ensure `NODE_ENV` is not set to `production`
- Verify `pino-pretty` is installed

## Performance

- **Pino** is one of the fastest Node.js loggers (benchmarked)
- Structured logging has minimal overhead
- OpenTelemetry uses batched span export
- Auto-instrumentation overhead is < 1% in most cases

## Further Reading

- [Pino Documentation](https://getpino.io/)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/instrumentation/js/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
