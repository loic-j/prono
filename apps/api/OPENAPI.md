# OpenAPI Implementation Guide

## Overview

This API now uses OpenAPI 3.1.0 specification with the following best practices:

### Key Features

1. **Schema Validation with Zod**: All request/response schemas are defined using Zod for runtime validation
2. **Type Safety**: Full TypeScript types are inferred from Zod schemas
3. **Auto-generated Documentation**: Interactive API docs using Scalar UI
4. **Centralized Schemas**: All schemas are in the `types` package for monorepo-wide reuse
5. **OpenAPI Compliance**: Full OpenAPI 3.1.0 specification compliance

## Accessing Documentation

Once the server is running:

- **Interactive API Docs**: http://localhost:3000/docs
- **OpenAPI Spec (JSON)**: http://localhost:3000/openapi.json

## Architecture

### Schema Definition (`packages/types/src/schemas.ts`)

All schemas are defined using Zod with OpenAPI annotations:

```typescript
export const HelloResponseSchema = z.object({
  message: z.string().openapi({ example: "Hello World!" }),
  timestamp: z.string().datetime(),
});
```

### Route Definition (`apps/api/src/app.ts`)

Routes are created using `createRoute` with full OpenAPI metadata:

```typescript
const helloRoute = createRoute({
  method: "get",
  path: "/hello",
  tags: ["Greetings"],
  summary: "Hello World",
  description: "Returns a simple hello world message",
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: HelloResponseSchema,
        },
      },
    },
  },
});

app.openapi(helloRoute, (c) => {
  // Handler with validated types
});
```

## Best Practices Implemented

### 1. Schema-First Design
- All schemas defined in a centralized location (`packages/types`)
- Schemas are reusable across API and frontend
- Single source of truth for data structures

### 2. Proper Validation
- Request parameters are validated using Zod schemas
- Invalid requests return 400 with detailed error messages
- Type-safe access to validated data: `c.req.valid("param")`

### 3. Comprehensive Documentation
- All routes include:
  - Tags for grouping
  - Summary and description
  - Request/response schemas
  - Example values
  - Status codes with descriptions

### 4. Error Handling
- Standardized error response schema
- Proper HTTP status codes
- Detailed error messages

### 5. OpenAPI Metadata
- Server information
- API version and description
- Tag descriptions
- Consistent response formats

## Adding New Endpoints

1. **Define Schema** in `packages/types/src/schemas.ts`:
```typescript
export const MyRequestSchema = z.object({
  field: z.string().min(1).openapi({ example: "value" }),
});

export const MyResponseSchema = z.object({
  result: z.string().openapi({ example: "success" }),
});
```

2. **Create Route** in `apps/api/src/app.ts`:
```typescript
const myRoute = createRoute({
  method: "post",
  path: "/my-endpoint",
  tags: ["MyTag"],
  summary: "My endpoint",
  description: "Description of what it does",
  request: {
    body: {
      content: {
        "application/json": {
          schema: MyRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: MyResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

api.openapi(myRoute, async (c) => {
  const body = c.req.valid("json");
  // Your logic here
  return c.json({ result: "success" });
});
```

3. **Export Schema** from `packages/types/src/index.ts` (already done via wildcard export)

## Tools & Libraries Used

- **@hono/zod-openapi**: OpenAPI integration for Hono
- **zod**: Schema validation and type inference
- **@scalar/hono-api-reference**: Beautiful API documentation UI
- **OpenAPI 3.1.0**: Latest OpenAPI specification

## Running the API

```bash
# Development mode with hot reload
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## Testing the API

You can test endpoints using:
- The interactive Scalar UI at `/docs`
- curl, Postman, or any HTTP client
- The frontend application

Example:
```bash
curl http://localhost:3000/api/hello
curl http://localhost:3000/api/hello/YourName
```
