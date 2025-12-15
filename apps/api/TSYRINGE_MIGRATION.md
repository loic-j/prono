# TSyringe DI Migration Summary

This document describes the migration from a manual dependency injection container to TSyringe.

## What Changed

### 1. Dependencies Added
- **tsyringe** (v4.10.0): Lightweight dependency injection container for TypeScript
- **reflect-metadata** (v0.2.2): Required for decorator metadata reflection

### 2. TypeScript Configuration
Updated [tsconfig.json](tsconfig.json) to enable decorator support:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### 3. Entry Point
Modified [src/index.ts](src/index.ts) to import `reflect-metadata` first:
```typescript
import "reflect-metadata";
```

### 4. Infrastructure Services - Using @singleton

All infrastructure services now use the `@singleton()` decorator for automatic lifecycle management:

#### [src/infra/repositories/user.repository.ts](src/infra/repositories/user.repository.ts)
```typescript
import { singleton } from "tsyringe";

@singleton()
export class InMemoryUserRepository implements IUserRepository {
  // ... implementation
}
```

#### [src/infra/services/email.service.ts](src/infra/services/email.service.ts)
```typescript
import { singleton } from "tsyringe";

@singleton()
export class ConsoleEmailService implements IEmailService {
  // ... implementation
}
```

#### [src/infra/supertokens/auth.adapter.ts](src/infra/supertokens/auth.adapter.ts)
```typescript
import { singleton } from "tsyringe";

@singleton()
export class SuperTokensAuthService implements IAuthService {
  // ... implementation
}
```

### 5. Use Cases - Using @injectable and @inject

Use cases now use `@injectable()` and `@inject()` decorators for automatic dependency resolution:

#### [src/usecases/example.usecases.ts](src/usecases/example.usecases.ts)
```typescript
import { injectable, inject } from "tsyringe";
import type { IUserRepository, IEmailService } from "../domain";

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(InMemoryUserRepository) private userRepository: IUserRepository,
    @inject(ConsoleEmailService) private emailService: IEmailService
  ) {}
  // ... implementation
}

@injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @inject(InMemoryUserRepository) private userRepository: IUserRepository
  ) {}
  // ... implementation
}
```

**Note:** Interface types must be imported with `import type` when using decorators with `emitDecoratorMetadata`.

### 6. Container Configuration

Replaced manual container creation with TSyringe container in [src/container.ts](src/container.ts):

**Before:**
```typescript
export function createContainer(): Container {
  const authService = new SuperTokensAuthService();
  const userRepository = new InMemoryUserRepository();
  const emailService = new ConsoleEmailService();
  
  const useCases = {
    registerUser: new RegisterUserUseCase(userRepository, emailService),
    updateUserProfile: new UpdateUserProfileUseCase(userRepository),
  };
  
  return { infra, useCases };
}
```

**After:**
```typescript
import { container } from "tsyringe";

export function initializeContainer(): void {
  // TSyringe handles registration via decorators
  console.log("TSyringe DI container initialized");
}

export function getUseCases(): UseCases {
  return {
    registerUser: container.resolve(RegisterUserUseCase),
    updateUserProfile: container.resolve(UpdateUserProfileUseCase),
  };
}

export { container };
```

### 7. Application Initialization

Updated [src/app.ts](src/app.ts) to use TSyringe's container resolution:

**Before:**
```typescript
const container = initializeContainer();
app.use("*", async (c, next) => {
  c.set("container", container);
  await next();
});
```

**After:**
```typescript
initializeContainer();
app.use("*", async (c, next) => {
  c.set("container", {
    infra: getInfrastructureServices(),
    useCases: getUseCases(),
  });
  await next();
});
```

## Benefits of TSyringe

1. **Automatic Dependency Resolution**: No need to manually wire dependencies
2. **Singleton Management**: `@singleton()` ensures single instances across the app
3. **Cleaner Code**: Decorators reduce boilerplate
4. **Type Safety**: Full TypeScript support with decorators
5. **Testing**: Easy to mock with `container.clearInstances()` and `container.register()`

## How to Use

### Resolving Dependencies Directly

```typescript
import { container } from "./container";
import { RegisterUserUseCase } from "./usecases/example.usecases";

// Get a singleton instance
const useCase = container.resolve(RegisterUserUseCase);
```

### In Handlers

Handlers continue to work the same way, getting the container from context:

```typescript
export const registerUserHandler = async (c: any) => {
  const container = c.get("container");
  const { registerUser } = container.useCases;
  const user = await registerUser.execute(email, password);
  return c.json({ id: user.id }, 201);
};
```

### Adding New Services

1. Create your service with `@singleton()` decorator:
```typescript
import { singleton } from "tsyringe";

@singleton()
export class MyNewService {
  // implementation
}
```

2. Inject it into use cases:
```typescript
import { injectable, inject } from "tsyringe";
import type { IMyInterface } from "../domain";

@injectable()
export class MyUseCase {
  constructor(
    @inject(MyNewService) private myService: IMyInterface
  ) {}
}
```

3. Resolve it from the container:
```typescript
const service = container.resolve(MyNewService);
```

## Testing

Reset the container between tests:

```typescript
import { container } from "./container";

afterEach(() => {
  container.clearInstances();
});
```

Mock dependencies:

```typescript
import { container } from "tsyringe";

const mockRepository = {
  findById: jest.fn(),
  // ...
};

container.register(InMemoryUserRepository, {
  useValue: mockRepository
});
```

## Migration Checklist

✅ Install tsyringe and reflect-metadata  
✅ Enable decorators in tsconfig.json  
✅ Import reflect-metadata in entry point  
✅ Add @singleton to infrastructure services  
✅ Add @injectable/@inject to use cases  
✅ Replace manual container with tsyringe  
✅ Update app.ts initialization  
✅ Verify type checking passes  

## References

- [TSyringe Documentation](https://github.com/microsoft/tsyringe)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
