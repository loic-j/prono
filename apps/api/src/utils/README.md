# Utilities

This directory contains reusable utility functions and helpers.

## Available Utilities

### Logger (`logger.ts`)

Production-grade structured logger with automatic OpenTelemetry trace context injection.

**Features:**
- Automatic trace_id, span_id injection
- Structured JSON logging (production)
- Pretty printing (development)
- Child logger creation
- Operation wrapping with tracing

**Usage:**
```typescript
import { logger, createChildLogger, withLogging } from '@/utils/logger';

// Basic logging
logger.info({ userId: '123' }, 'User logged in');

// Child logger with context
const reqLogger = createChildLogger({ requestId: req.id });
reqLogger.info('Processing request');

// Wrapped operation with automatic tracing
const result = await withLogging('db-query', async () => {
  return await db.query(...);
});
```

See [LOGGING.md](../LOGGING.md) for complete documentation.

## Adding New Utilities

When adding new utilities:

1. Create a new file in this directory
2. Export functions with clear TypeScript types
3. Add JSDoc comments for documentation
4. Update this README with usage examples
5. Add tests if applicable

## Best Practices

- Keep utilities pure and stateless when possible
- Use TypeScript for type safety
- Document all exported functions
- Consider reusability across different contexts
- Avoid dependencies on specific frameworks when possible
