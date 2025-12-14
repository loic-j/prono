# Dependency Injection Guide

This document explains how the dependency injection (DI) system works in this application and how to use it effectively.

## Architecture Overview

The application follows a clean architecture pattern with dependency injection:

```
┌─────────────────────────────────────────────────────┐
│                    Handlers                          │
│  (HTTP request/response, get deps from container)   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Use Cases                           │
│     (Business logic, depends on interfaces)         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│            Domain Interfaces (Ports)                 │
│  (IUserRepository, IEmailService, IAuthService)     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│          Infrastructure Implementations              │
│   (InMemoryUserRepository, ConsoleEmailService)     │
└─────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Domain Interfaces (Ports)

Domain interfaces define contracts without implementation details. They live in `src/domain/`:

- `IUserRepository` - User data persistence
- `IEmailService` - Email sending
- `IAuthService` - Authentication

### 2. Infrastructure Implementations (Adapters)

Concrete implementations of domain interfaces in `src/infra/`:

- `InMemoryUserRepository` implements `IUserRepository`
- `ConsoleEmailService` implements `IEmailService`
- `SuperTokensAuthService` implements `IAuthService`

### 3. Use Cases

Business logic that depends on domain interfaces, not concrete implementations:

```typescript
export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string, password: string) {
    // Business logic here
  }
}
```

### 4. DI Container

The container (`src/container.ts`) wires everything together:

```typescript
export function createContainer(): Container {
  // Create infrastructure instances
  const userRepository = new InMemoryUserRepository();
  const emailService = new ConsoleEmailService();

  // Inject into use cases
  const registerUser = new RegisterUserUseCase(userRepository, emailService);

  return { infra, useCases };
}
```

## Usage in Handlers

Handlers access dependencies through the Hono context:

```typescript
export const registerUserHandler = async (c: any) => {
  // Get container from context
  const container = c.get("container");

  // Access use case
  const { registerUser } = container.useCases;

  // Execute business logic
  const user = await registerUser.execute(email, password);

  return c.json({ id: user.id }, 201);
};
```

## Adding New Dependencies

### Step 1: Define Domain Interface

Create interface in `src/domain/`:

```typescript
// src/domain/repositories.interface.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductDto): Promise<Product>;
}
```

### Step 2: Create Infrastructure Implementation

Implement interface in `src/infra/`:

```typescript
// src/infra/repositories/product.repository.ts
export class InMemoryProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    // Implementation
  }

  async create(data: CreateProductDto): Promise<Product> {
    // Implementation
  }
}
```

### Step 3: Update Container

Add to `src/container.ts`:

```typescript
export interface InfrastructureServices {
  authService: IAuthService;
  userRepository: IUserRepository;
  emailService: IEmailService;
  productRepository: IProductRepository; // Add this
}

export function createContainer(): Container {
  // ...existing code...

  const productRepository = new InMemoryProductRepository();

  const infra: InfrastructureServices = {
    authService,
    userRepository,
    emailService,
    productRepository, // Add this
  };

  // ...rest of code...
}
```

### Step 4: Create Use Case

```typescript
// src/usecases/product.usecases.ts
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductDto): Promise<Product> {
    // Business logic
    return this.productRepository.create(data);
  }
}
```

### Step 5: Register Use Case in Container

```typescript
export interface UseCases {
  registerUser: RegisterUserUseCase;
  updateUserProfile: UpdateUserProfileUseCase;
  createProduct: CreateProductUseCase; // Add this
}

export function createContainer(): Container {
  // ...existing code...

  const useCases: UseCases = {
    registerUser: new RegisterUserUseCase(userRepository, emailService),
    updateUserProfile: new UpdateUserProfileUseCase(userRepository),
    createProduct: new CreateProductUseCase(productRepository), // Add this
  };

  return { infra, useCases };
}
```

### Step 6: Use in Handler

```typescript
export const createProductHandler = async (c: any) => {
  const container = c.get("container");
  const { createProduct } = container.useCases;

  const data = await c.req.json();
  const product = await createProduct.execute(data);

  return c.json(product, 201);
};
```

## Benefits

### 1. **Testability**

Easy to mock dependencies in tests:

```typescript
const mockRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const useCase = new RegisterUserUseCase(mockRepository, mockEmailService);
```

### 2. **Flexibility**

Swap implementations without changing business logic:

```typescript
// Development
const userRepository = new InMemoryUserRepository();

// Production
const userRepository = new PrismaUserRepository();
```

### 3. **Separation of Concerns**

- Domain layer doesn't know about infrastructure
- Use cases focus on business logic
- Handlers focus on HTTP concerns

### 4. **Maintainability**

- All dependencies declared in one place (container)
- Easy to see what depends on what
- Changes to infrastructure don't affect business logic

## Container Lifecycle

The container is initialized once at application startup:

```typescript
// src/app.ts
import { initializeContainer } from "./container";

const container = initializeContainer();

app.use("*", async (c, next) => {
  c.set("container", container);
  await next();
});
```

All dependencies are singletons - created once and reused throughout the application lifecycle.

## Current Infrastructure Implementations

### InMemoryUserRepository
- Simple in-memory storage
- Good for development/testing
- **Replace with database implementation for production**

### ConsoleEmailService
- Logs emails to console
- Good for development
- **Replace with real email service for production** (SendGrid, AWS SES, Resend)

### SuperTokensAuthService
- Production-ready authentication
- Implements `IAuthService`
- Wraps SuperTokens SDK

## Migration Path to Production

1. **Database**: Replace `InMemoryUserRepository` with `PrismaUserRepository`
2. **Email**: Replace `ConsoleEmailService` with `SendGridEmailService`
3. **Update container**: Change implementations in `createContainer()`
4. **No changes needed**: Use cases and handlers remain the same!

## Example: Replacing In-Memory with Prisma

```typescript
// src/infra/repositories/prisma-user.repository.ts
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToEntity(user) : null;
  }
  // ...other methods
}

// src/container.ts
export function createContainer(): Container {
  const prisma = new PrismaClient();
  const userRepository = new PrismaUserRepository(prisma); // Changed!

  // Everything else stays the same
  const useCases = {
    registerUser: new RegisterUserUseCase(userRepository, emailService),
    // ...
  };
}
```

## Access Patterns

### Access Infrastructure Services Directly

```typescript
const container = c.get("container");
const user = await container.infra.authService.getUserById(userId);
```

### Access Use Cases

```typescript
const container = c.get("container");
const result = await container.useCases.registerUser.execute(email, password);
```

## Best Practices

1. **Always inject interfaces, not implementations** in use cases
2. **Keep business logic in use cases**, not handlers
3. **One container per application** - initialize once
4. **Make infrastructure implementations swappable**
5. **Test use cases with mock dependencies**
6. **Handlers should be thin** - just get deps and call use cases

## Files Structure

```
src/
├── container.ts              # DI container configuration
├── domain/
│   ├── auth.interface.ts     # IAuthService interface
│   ├── repositories.interface.ts  # IUserRepository, IEmailService
│   └── user.entity.ts        # Domain entities
├── infra/
│   ├── repositories/
│   │   └── user.repository.ts     # InMemoryUserRepository
│   ├── services/
│   │   └── email.service.ts       # ConsoleEmailService
│   └── supertokens/
│       └── auth.adapter.ts        # SuperTokensAuthService
├── usecases/
│   └── example.usecases.ts   # Business logic
└── handlers/
    ├── auth.handler.ts       # Uses container.infra.authService
    └── user.handler.ts       # Uses container.useCases
```
