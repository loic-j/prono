# Error Handling Architecture

This project follows clean architecture principles for error handling. Errors are handled in a structured, layered approach where each layer has its own set of errors, and the presentation layer (Hono's error handler) is responsible for converting errors to HTTP responses.

## Philosophy

1. **Separation of Concerns**: Business logic throws errors, HTTP layer handles responses
2. **Type Safety**: All errors are strongly typed and extend base error classes
3. **Structured Logging**: Errors include context and are logged appropriately
4. **Client-Friendly**: API clients receive consistent, parseable error responses

## Error Hierarchy

```
ApplicationError (abstract base)
├── ClientError (4xx errors)
│   ├── BadRequestError (400)
│   ├── UnauthorizedError (401)
│   │   ├── AuthenticationFailedError
│   │   ├── InvalidSessionError
│   │   └── SessionRefreshRequiredError
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   │   ├── UserNotFoundError
│   │   └── UserAlreadyExistsError
│   ├── ConflictError (409)
│   └── ValidationError (422)
└── ServerError (5xx errors)
    ├── InternalServerError (500)
    │   └── DatabaseError
    └── ServiceUnavailableError (503)
        ├── ExternalServiceError
        └── SuperTokensError
```

## Error Categories

### Base Errors (`domain/errors/base.error.ts`)

- **ApplicationError**: Abstract base class for all errors
  - Properties: `statusCode`, `code`, `isOperational`, `context`
  - Methods: `toJSON()`
- **ClientError**: Base for 4xx errors (operational errors)
- **ServerError**: Base for 5xx errors (non-operational errors)

### HTTP Errors (`domain/errors/http.errors.ts`)

Standard HTTP error codes:
- `BadRequestError` - Malformed requests
- `UnauthorizedError` - Authentication required/failed
- `ForbiddenError` - Insufficient permissions
- `NotFoundError` - Resource not found
- `ConflictError` - Request conflicts with current state
- `ValidationError` - Input validation failed
- `InternalServerError` - Generic server error
- `ServiceUnavailableError` - External service unavailable

### Domain Errors (`domain/errors/domain.errors.ts`)

Business logic specific errors:
- **Authentication**:
  - `AuthenticationFailedError` - Login/auth failed
  - `InvalidSessionError` - Session invalid/expired
  - `SessionRefreshRequiredError` - Token refresh needed

- **User Management**:
  - `UserNotFoundError` - User doesn't exist
  - `UserAlreadyExistsError` - Duplicate user

### Infrastructure Errors (`domain/errors/infra.errors.ts`)

Infrastructure layer errors:
- `DatabaseError` - Database operation failed
- `ExternalServiceError` - External service unavailable
- `SuperTokensError` - SuperTokens service error

## Usage

### Throwing Errors

**In Middleware:**
```typescript
import { InvalidSessionError, UserNotFoundError } from "../domain/errors";

export const authMiddleware = async (c: Context, next: Next) => {
  const session = await getSession(request, response);
  
  if (!session) {
    throw new InvalidSessionError("Not authenticated");
  }
  
  const user = await authService.getUserById(userId);
  if (!user) {
    throw new UserNotFoundError(userId, "User not found");
  }
  
  await next();
};
```

**In Handlers:**
```typescript
import { UserNotFoundError, SuperTokensError } from "../domain/errors";

export const getCurrentUserHandler = async (c: Context) => {
  const session = c.get("session");
  
  if (!session) {
    throw new InvalidSessionError("Not authenticated");
  }
  
  const user = await authService.getUserById(session.getUserId());
  if (!user) {
    throw new UserNotFoundError(session.getUserId());
  }
  
  return c.json({ user });
};
```

**In Use Cases:**
```typescript
import { ValidationError, ConflictError } from "../domain/errors";

export class CreateUserUseCase {
  async execute(email: string) {
    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format", { email });
    }
    
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User already exists", { email });
    }
    
    // ... create user
  }
}
```

### Error Handler

The error handler in `middleware/logging.middleware.ts` automatically:
1. Detects `ApplicationError` instances
2. Logs appropriately (warn for operational, error for non-operational)
3. Returns structured JSON response with error code and message
4. Includes stack traces in development mode only

**Response Format:**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "context": {
      "userId": "123"
    }
  }
}
```

### Creating Custom Errors

1. **Extend appropriate base class:**
```typescript
import { NotFoundError } from "./http.errors";

export class TeamNotFoundError extends NotFoundError {
  readonly code = "TEAM_NOT_FOUND";
  
  constructor(teamId: string) {
    super("Team not found", { teamId });
  }
}
```

2. **Export from index:**
```typescript
export { TeamNotFoundError } from "./domain.errors";
```

3. **Use it:**
```typescript
throw new TeamNotFoundError(teamId);
```

### Error Factories (Optional)

For common validation scenarios, use the built-in error factories:

```typescript
import { ErrorFactory } from "../domain/errors";

// Validation errors
throw ErrorFactory.validation.required("email");
throw ErrorFactory.validation.invalidFormat("email", "valid email address");
throw ErrorFactory.validation.tooShort("password", 8, password.length);
throw ErrorFactory.validation.invalidEnum("role", ["admin", "user"]);

// Not found errors
throw ErrorFactory.notFound.user(userId);
throw ErrorFactory.notFound.resource("Team", teamId);

// Auth errors
throw ErrorFactory.auth.notAuthenticated();
throw ErrorFactory.auth.invalidCredentials();
throw ErrorFactory.auth.insufficientPermissions("user profile", "edit");

// Conflict errors
throw ErrorFactory.conflict.alreadyExists("User", email);
throw ErrorFactory.conflict.stateConflict(
  "Cannot delete active team",
  "active",
  "archived"
);

// Bad request errors
throw ErrorFactory.badRequest.missingHeader("Authorization");
throw ErrorFactory.badRequest.invalidContentType(contentType, "application/json");
```

## Best Practices

1. **Always throw, never return error responses** in business logic
2. **Use specific error types** rather than generic ones
3. **Include context** when it helps debugging
4. **Map external errors** to domain errors at boundaries
5. **Let the error handler format responses** - don't create JSON responses in business logic
6. **Use isOperational flag** to distinguish expected vs unexpected errors

## Error Context

Include relevant context for debugging:
```typescript
throw new UserNotFoundError(userId, "User not found after authentication", {
  requestId: c.get("requestId"),
  timestamp: new Date().toISOString(),
});
```

Context is:
- Logged for debugging
- Included in development responses (excluded in production)
- Never shown to end users in production

## Layer Responsibilities

| Layer | Responsibility | Throws |
|-------|---------------|--------|
| Domain | Business logic validation | Domain errors |
| Infrastructure | External service communication | Infrastructure errors |
| Middleware | Request validation, auth | Auth, validation errors |
| Handlers | Orchestration | Any error type |
| Error Handler | Response formatting | Nothing (catches all) |

## Testing

When testing, verify errors are thrown correctly:
```typescript
it("should throw UserNotFoundError when user doesn't exist", async () => {
  await expect(getCurrentUserHandler(mockContext))
    .rejects
    .toThrow(UserNotFoundError);
});
```

## Migration from Old Code

**Before:**
```typescript
if (!user) {
  return c.json({ error: "User not found" }, 404);
}
```

**After:**
```typescript
if (!user) {
  throw new UserNotFoundError(userId);
}
```

The error handler will automatically convert this to the appropriate HTTP response.
