# Backend Architecture Reorganization

## Overview
The backend has been reorganized following **Clean Architecture** and **Domain-Driven Design** principles.

## New Folder Structure

```
apps/api/src/
├── handlers/           # Request handlers with syntactic validation
│   ├── health.handler.ts
│   └── greeting.handler.ts
├── routes/             # Route definitions with OpenAPI schemas
│   ├── index.ts        # Main router
│   ├── health.routes.ts
│   └── greeting.routes.ts
├── usecases/           # Business logic and orchestration (empty for now)
│   └── README.md
├── domain/             # Domain entities and business rules (empty for now)
│   └── README.md
├── infra/              # Infrastructure adapters (empty for now)
│   └── README.md
├── utils/              # Utility functions (empty for now)
│   └── README.md
├── app.ts              # Main application setup
└── index.ts            # Server entry point
```

## Architecture Layers

### 1. **Handlers** (`/handlers`)
- Contains HTTP request handlers
- One file per handler type (health, greeting, etc.)
- Performs **syntactic validation** (format checking)
- Examples: email format, required fields, parameter types
- Delegates business logic to use cases
- Returns HTTP responses

### 2. **Routes** (`/routes`)
- Defines API routes with OpenAPI schemas
- Maps HTTP endpoints to handlers
- Handles routing configuration
- Documents API contracts

### 3. **Use Cases** (`/usecases`)
- Business logic and application services
- Orchestrates calls between domain and infrastructure
- Currently empty (to be populated as features are added)
- Will contain:
  - Application-specific business rules
  - Transaction coordination
  - Cross-cutting concerns

### 4. **Domain** (`/domain`)
- Core business entities and value objects
- Domain business rules and logic
- Interfaces (ports) for infrastructure
- Framework-agnostic
- Currently empty (to be populated as business logic is added)
- Will contain:
  - Entities
  - Value Objects
  - Domain Services
  - Repository Interfaces
  - Domain Events

### 5. **Infrastructure** (`/infra`)
- Implementations of domain interfaces (adapters)
- Database repositories
- External service clients
- Third-party integrations
- Currently empty (to be populated as needed)
- Will contain:
  - Database implementations
  - API clients
  - Message queue adapters
  - File system operations

### 6. **Utils** (`/utils`)
- Shared utility functions
- Pure functions without side effects
- Common validators and helpers
- Currently empty (to be populated as needed)

## Key Principles Applied

### Clean Architecture
- **Separation of Concerns**: Each layer has a clear responsibility
- **Dependency Rule**: Dependencies point inward (handlers → usecases → domain)
- **Independence**: Domain logic is independent of frameworks and infrastructure

### Domain-Driven Design
- **Ubiquitous Language**: Code reflects business terminology
- **Bounded Contexts**: Clear boundaries between different areas
- **Layered Architecture**: Separation between domain, application, and infrastructure

## Current Implementation

### Health Check Handler
- **File**: `handlers/health.handler.ts`
- **Responsibility**: Returns server health status
- **Route**: `GET /health`

### Greeting Handlers
- **File**: `handlers/greeting.handler.ts`
- **Responsibilities**:
  - `helloHandler`: Returns simple greeting
  - `helloNameHandler`: Returns personalized greeting with name validation
- **Routes**: 
  - `GET /api/hello`
  - `GET /api/hello/{name}`

## Next Steps

As new features are added:

1. **Domain Logic**: Create domain entities in `/domain` with business rules
2. **Use Cases**: Implement business logic in `/usecases` that orchestrates domain and infrastructure
3. **Infrastructure**: Add repository implementations, external services in `/infra`
4. **Handlers**: Create new handlers that delegate to use cases
5. **Routes**: Define new routes with proper OpenAPI documentation

## Benefits

- **Maintainability**: Clear separation makes code easier to understand and modify
- **Testability**: Each layer can be tested independently
- **Flexibility**: Easy to swap implementations (e.g., change database)
- **Scalability**: Well-organized structure supports growing complexity
- **Team Collaboration**: Clear boundaries reduce conflicts and improve collaboration
