import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import {
  HealthResponseSchema,
  HelloResponseSchema,
  HelloNameParamSchema,
  ErrorResponseSchema,
} from "@prono/types";

// Create OpenAPI-enabled app with proper typing
const app = new OpenAPIHono();

// Add CORS middleware
app.use("*", cors());

// ============================================================================
// Health Check Route
// ============================================================================

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Health check endpoint",
  description: "Returns the health status of the API server",
  responses: {
    200: {
      description: "Server is healthy",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

app.openapi(healthRoute, (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================================
// API Routes
// ============================================================================

const api = new OpenAPIHono();

// Hello World endpoint
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

api.openapi(helloRoute, (c) => {
  return c.json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  });
});

// Hello with name parameter endpoint
const helloNameRoute = createRoute({
  method: "get",
  path: "/hello/{name}",
  tags: ["Greetings"],
  summary: "Personalized greeting",
  description: "Returns a personalized greeting message",
  request: {
    params: HelloNameParamSchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: HelloResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

api.openapi(helloNameRoute, (c) => {
  const { name } = c.req.valid("param");
  return c.json(
    {
      message: `Hello ${name}!`,
      timestamp: new Date().toISOString(),
    },
    200
  );
});

// Mount API routes under /api prefix
app.route("/api", api);

// ============================================================================
// OpenAPI Documentation
// ============================================================================

// OpenAPI spec endpoint
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Prono API",
    version: "1.0.0",
    description: "API for the Prono application",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Health check endpoints",
    },
    {
      name: "Greetings",
      description: "Greeting endpoints for demonstration",
    },
  ],
});

// Scalar API documentation UI
app.get(
  "/docs",
  apiReference({
    theme: "purple",
    pageTitle: "Prono API Documentation",
    spec: {
      url: "/openapi.json",
    },
  } as any)
);

// Root endpoint - redirect to docs
app.get("/", (c) => {
  return c.redirect("/docs");
});

// Export a standard Hono type for RPC compatibility
// OpenAPIHono extends Hono, so we can type assert for the client
export type AppType = typeof app;

export default app;
