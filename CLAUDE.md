# Prono Project

## WHAT

### Tech Stack
- **Monorepo**: pnpm workspaces
- **Backend** (`apps/api`): Hono + TypeScript + SuperTokens auth + OpenAPI
- **Frontend** (`apps/web`): React + TypeScript + Vite + SuperTokens UI
- **Shared** (`packages/types`): Zod schemas + TypeScript types
- **Infrastructure**: Docker, PostgreSQL (planned)

### Project Structure
```
apps/
  api/           # Hono backend API
    src/
      domain/    # Business entities & interfaces (DDD)
      infra/     # Infrastructure adapters (SuperTokens, DB, etc.)
      handlers/  # Request handlers with validation
      routes/    # API routes with OpenAPI specs
      usecases/  # Business logic orchestration
      middleware/# Middleware functions
      utils/     # Utility functions
  web/           # React frontend
packages/
  types/         # Shared TypeScript types & Zod schemas
```

### Architecture Principles
- **Clean Architecture**: Domain → Use Cases → Handlers → Routes
- **Domain-Driven Design**: Business logic in domain layer
- **Dependency Rule**: Dependencies point inward (handlers → usecases → domain)
- **Infrastructure Isolation**: Auth, DB, external services in `infra/`

### General Instructions

* **Documentation:** Update this `claude.md` file whenever core changes occur.
* **Environment Variables:** Always use the global configuration file at the root (it handles defaults for local development). **Never** access `process.env` directly.

## WHY

<!-- To be filled: Project purpose and goals -->

## HOW

<!-- To be filled: Development workflow and operational instructions -->

## Documentation Index

### Core Documentation
- [Authentication Guide](AUTHENTICATION.md) - Complete authentication setup & usage guide

### Backend Documentation
- [Architecture Overview](apps/api/ARCHITECTURE.md) - Clean architecture & DDD structure
- [Authentication Setup](apps/api/AUTH_SETUP.md) - SuperTokens backend integration & testing

### Commands
```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start all apps
cd apps/api && pnpm dev    # Backend only
cd apps/web && pnpm dev    # Frontend only

# Build
pnpm build            # Build all packages

# Type check
cd apps/api && pnpm type-check
```

### Key Conventions
1. **One file per handler type** in `handlers/`
2. **One file per route group** in `routes/`
3. **Domain interfaces** define contracts for infrastructure
4. **Handlers** perform syntactic validation only
5. **Use cases** contain business logic
6. **Middleware** in `middleware/` folder
7. **All routes** use OpenAPI schema definitions

### Environment
- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- Authentication uses SuperTokens (frontend + backend integration)
- See [AUTHENTICATION.md](AUTHENTICATION.md) for complete auth setup and usage
- See [apps/api/AUTH_SETUP.md](apps/api/AUTH_SETUP.md) for backend-only SuperTokens testing
