# Quick Start Guide

## Installation Complete ✅

Your application now has:
- 🪵 **Pino** structured logger with automatic trace context
- 🔍 **OpenTelemetry** distributed tracing with auto-instrumentation
- 🔗 **W3C Trace Context** propagation across requests
- 📊 **OTLP exporter** for sending traces to observability backends

## Testing the Setup

### 1. Start the Development Server

```bash
cd apps/api
pnpm dev
```

You should see:
```
✅ OpenTelemetry initialized for service: prono-api
📡 Exporting traces to: http://localhost:4318/v1/traces
[HH:MM:SS UTC] INFO: Server starting
    service: "prono-api"
    environment: "development"
    port: 3000
```

### 2. Make a Request

```bash
curl http://localhost:3000/health
```

You'll see logs like:
```
[HH:MM:SS UTC] INFO: Incoming request
    trace_id: "abc123..."
    span_id: "def456..."
    type: "request"
    method: "GET"
    url: "http://localhost:3000/health"

[HH:MM:SS UTC] INFO: Request completed
    trace_id: "abc123..."
    span_id: "def456..."
    type: "response"
    status: 200
    duration_ms: 5
```

### 3. View Traces with Jaeger (Optional)

Start Jaeger locally:
```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

Then visit http://localhost:16686 to see your traces!

## Using the Logger in Your Code

```typescript
import { logger } from '@/utils/logger';

// Simple log
logger.info('User action completed');

// Structured logging
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Different levels
logger.debug({ query: 'SELECT *...' }, 'Database query');
logger.warn({ retries: 3 }, 'Retrying operation');
logger.error({ error: err }, 'Operation failed');

// Wrapped operations with automatic tracing
import { withLogging } from '@/utils/logger';

const result = await withLogging('database-query', async () => {
  return await db.users.find({ id: userId });
}, { userId });
```

## Environment Variables

Create a `.env` file in `apps/api/`:

```bash
# Logging
LOG_LEVEL=debug              # For development
NODE_ENV=development

# OpenTelemetry
OTEL_SERVICE_NAME=prono-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

For production:
```bash
LOG_LEVEL=info               # Less verbose
NODE_ENV=production
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-backend.com/v1/traces
```

## What's Automatic

✅ Every log includes trace context (trace_id, span_id)
✅ HTTP requests are traced and logged
✅ Traces propagate via traceparent/tracestate headers
✅ Errors are logged with full context
✅ JSON logs in production, pretty-print in development

## Documentation

- [LOGGING.md](./LOGGING.md) - Complete logging guide
- [apps/api/src/utils/README.md](./src/utils/README.md) - Utilities documentation

## Troubleshooting

**Logs don't have trace_id?**
- Telemetry must be initialized first in index.ts ✅ (already done)

**Traces not in Jaeger?**
- Ensure Jaeger is running on port 4318
- Check OTEL_EXPORTER_OTLP_ENDPOINT

**Pretty logs in production?**
- Set NODE_ENV=production

## Next Steps

1. ✅ Logger is integrated - use it everywhere instead of console.log
2. ✅ OpenTelemetry is configured - traces are exported
3. ✅ Middleware is active - all requests are logged
4. 🎯 Optional: Set up Jaeger/Grafana/Datadog for trace visualization
5. 🎯 Optional: Add custom spans for specific operations

Enjoy your production-grade observability! 🚀
