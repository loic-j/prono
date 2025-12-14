# Prono Monorepo

A modern monorepo built with Hono, React, and TypeScript featuring end-to-end type safety.

## 🚀 Features

- **Hono** - Fast, lightweight web framework
- **React + Vite** - Modern frontend with lightning-fast dev experience
- **Hono RPC** - End-to-end type safety between frontend and backend
- **pnpm workspaces** - Efficient monorepo management
- **TypeScript** - Strict type checking across all packages
- **Docker** - Production-ready containerization
- **GitHub Actions** - Automated CI/CD pipelines

## 📁 Project Structure

```
prono/
├── apps/
│   ├── api/              # Hono backend API
│   │   ├── src/
│   │   │   ├── app.ts    # Hono app with routes
│   │   │   └── index.ts  # Server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── App.tsx   # Main app component
│       │   └── main.tsx  # Entry point
│       ├── Dockerfile
│       ├── nginx.conf
│       └── package.json
├── packages/
│   └── types/            # Shared TypeScript types
│       └── src/
│           └── index.ts
├── .github/
│   └── workflows/        # CI/CD pipelines
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## 🛠️ Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Docker** (optional, for containerized deployment)

## 🚦 Getting Started

### 1. Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run in development mode

```bash
# Start both API and web in watch mode
pnpm dev
```

This will start:
- **API** on http://localhost:3000
- **Web** on http://localhost:5173

### 4. Build for production

```bash
pnpm build
```

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

### Build individual containers

```bash
# Build API
docker build -t prono-api -f apps/api/Dockerfile .

# Build Web
docker build -t prono-web -f apps/web/Dockerfile .

# Run API
docker run -p 3000:3000 prono-api

# Run Web
docker run -p 80:80 prono-web
```

## 📦 Available Scripts

### Root level

- `pnpm dev` - Run all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Lint all packages

### Per package

```bash
# API
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api start

# Web
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web preview
```

## 🔧 Development

### Adding a new package

1. Create a new directory in `packages/`
2. Add `package.json` with the package name
3. Update `pnpm-workspace.yaml` if needed
4. Run `pnpm install`

### Type-safe API calls

The frontend uses Hono RPC for end-to-end type safety:

```typescript
import { hc } from 'hono/client'
import type { AppType } from '../../api/src/app'

const client = hc<AppType>('/api')

// TypeScript knows the exact response type!
const res = await client.hello.$get()
const data = await res.json() // Fully typed
```

## 🚀 Deployment

### GitHub Container Registry

Push to the `main` branch to automatically build and push Docker images to GitHub Container Registry (ghcr.io).

Images will be available at:
- `ghcr.io/<your-username>/prono/api:latest`
- `ghcr.io/<your-username>/prono/web:latest`

### Kubernetes

Example deployment (create `k8s/` directory with manifests):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prono-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: prono-api
  template:
    metadata:
      labels:
        app: prono-api
    spec:
      containers:
      - name: api
        image: ghcr.io/<your-username>/prono/api:latest
        ports:
        - containerPort: 3000
```

### Serverless Options

**Cloudflare Workers:**
- Hono has first-class support for Cloudflare Workers
- Update build config to target Workers runtime
- Use Cloudflare D1 for database

**Vercel/Netlify:**
- Deploy frontend to Vercel/Netlify
- Deploy API to Vercel Serverless Functions or keep separate

## 🔐 Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# API
PORT=3000
NODE_ENV=development

# Database (when added)
DATABASE_URL=postgresql://user:password@localhost:5432/prono

# Frontend
VITE_API_URL=http://localhost:3000
```

## 📚 Next Steps

### Adding a Database

1. **Install Drizzle ORM:**
```bash
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

2. **Create schema in `packages/db`**

3. **Update docker-compose.yml** to include database service

### Adding Authentication

- Consider **Lucia** or **Better Auth** for Hono
- JWT tokens with Hono's built-in JWT middleware

### Adding Validation

```bash
pnpm add zod
```

Use Zod with Hono's validator middleware for request validation.

## 📖 Resources

- [Hono Documentation](https://hono.dev)
- [Hono RPC](https://hono.dev/guides/rpc)
- [Vite Documentation](https://vitejs.dev)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 📄 License

MIT
