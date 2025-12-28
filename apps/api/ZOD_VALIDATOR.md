# Using @hono/zod-validator

This project uses `@hono/zod-openapi` for OpenAPI-documented routes and `@hono/zod-validator` for standard routes. Here's how to use them:

## Installation

Already installed in this project:
```json
"@hono/zod-openapi": "^1.1.5",
"@hono/zod-validator": "^latest"
```

## Basic Usage

### 1. Define Zod Schemas

Schemas are centralized in `/packages/types/src/schemas.ts`:

```typescript
export const RegisterUserRequestSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(8).openapi({ example: "securePass123!" }),
});

export const RegisterUserResponseSchema = z.object({
  id: z.string().openapi({ example: "user_123456" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  message: z.string().openapi({ example: "User registered successfully" }),
});
```

### 2. Use with OpenAPI Routes (for documented endpoints)

For endpoints that need to appear in OpenAPI documentation, use `@hono/zod-openapi`:

**Route definition:**
```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { RegisterUserRequestSchema, RegisterUserResponseSchema } from "@prono/types";

export const userRoutes = new OpenAPIHono();

userRoutes.openapi(
  {
    method: "post",
    path: "/users/register",
    tags: ["Users"],
    summary: "Register a new user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: RegisterUserRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: RegisterUserResponseSchema,
          },
        },
      },
    },
  },
  registerUserHandler // Just pass the handler, validation is automatic
);
```

**Handler:**
```typescript
export const registerUserHandler = async (c: any) => {
  // Get validated data from middleware - no manual parsing needed!
  const { email, password } = c.req.valid("json");

  // Use the validated data...
  const container = c.get("container");
  const { registerUser } = container.useCases;
  const user = await registerUser.execute(email, password);

  return c.json(
    {
      id: user.id,
      email: user.email,
      message: "User registered successfully",
    },
    201
  );
};
```

### 3. Use with Standard Hono Routes (for simple validation)

For endpoints that don't need OpenAPI documentation, use `@hono/zod-validator`:

**Route definition:**
```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const ExampleSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
});

app.post(
  "/examples/validation",
  zValidator("json", ExampleSchema), // Apply validator middleware
  async (c) => {
    // Access validated data
    const data = c.req.valid("json");
    return c.json({ message: "Success", data }, 200);
  }
);
```

**Handler (if extracted):**
```typescript
export const exampleValidationHandler = async (c: any) => {
  // Get validated data from middleware
  const data = c.req.valid("json");
  
  return c.json({ message: "Success", data }, 200);
};
```

## Key Differences

| Feature | OpenAPI Routes | Standard Routes |
|---------|---------------|----------------|
| **Import** | `@hono/zod-openapi` | `@hono/zod-validator` |
| **Hono Class** | `OpenAPIHono` | `Hono` |
| **Method** | `.openapi()` | `.get()`, `.post()`, etc. |
| **Validation** | Automatic via schema | Manual via `zValidator()` middleware |
| **Documentation** | Auto-generated | Not generated |
| **Handler Access** | `c.req.valid("json")` | `c.req.valid("json")` |

## Validator Locations

The `zValidator` middleware can validate different parts of the request:

- `zValidator("json", schema)` - Validate request body (JSON)
- `zValidator("form", schema)` - Validate form data
- `zValidator("query", schema)` - Validate query parameters
- `zValidator("param", schema)` - Validate URL parameters
- `zValidator("header", schema)` - Validate headers
- `zValidator("cookie", schema)` - Validate cookies

For OpenAPI routes, use the schema definition in the route config instead.

## Error Handling

Validation errors are automatically caught and returned as 400 Bad Request responses:

```json
{
  "error": "Validation Error",
  "message": "Invalid input",
  "details": {
    "email": "Invalid email format"
  }
}
```

## Best Practices

1. **Use OpenAPI routes for documented APIs** - They provide automatic validation and documentation
2. **Use standard routes with zValidator for internal/simple endpoints** - Lighter weight
3. **Centralize schemas** - Define all schemas in `/packages/types/src/schemas.ts`
4. **Use `c.req.valid()` in handlers** - Never manually parse or validate in handlers
5. **Add OpenAPI metadata** - Use `.openapi()` for better documentation:
   ```typescript
   z.string().email().openapi({ example: "user@example.com" })
   ```
6. **Type safety** - Export TypeScript types from schemas:
   ```typescript
   export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;
   ```
7. **Don't mix patterns** - OpenAPI routes don't need `zValidator()` middleware

## Examples in This Project

- **OpenAPI documented routes:**
  - [User routes](../routes/user.routes.ts) - Registration and profile management
  - [Auth custom routes](../routes/auth-custom.routes.ts) - Current user and sign out
  - [Greeting routes](../routes/greeting.routes.ts) - Hello endpoints
  - [Health routes](../routes/health.routes.ts) - Health check

- **Standard routes with zValidator:**
  - [Example routes](../routes/example.routes.ts) - Validation examples

- **Schemas:**
  - [All schemas](../../packages/types/src/schemas.ts) - Centralized schema definitions
