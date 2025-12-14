import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { createRoutes } from "./routes";

// Create OpenAPI-enabled app with proper typing
const app = new OpenAPIHono();

// Add CORS middleware
app.use("*", cors());

// ============================================================================
// Routes
// ============================================================================

// Mount all routes
const routes = createRoutes();
app.route("/", routes);

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
