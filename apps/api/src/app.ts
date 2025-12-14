import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { createRoutes } from "./routes";
import { initSuperTokens } from "./infra/supertokens";
import {
  loggingMiddleware,
  errorLoggingMiddleware,
} from "./middleware/logging.middleware";
import { initializeContainer } from "./container";
import { AppContext } from "./types/context.types";

// Initialize SuperTokens
initSuperTokens();

// Initialize DI Container
const container = initializeContainer();

// Create OpenAPI-enabled app with proper typing
const app = new OpenAPIHono<AppContext>();

// Add DI container to context for all requests
app.use("*", async (c, next) => {
  c.set("container", container);
  await next();
});

// Add logging middleware with OpenTelemetry trace propagation
app.use("*", loggingMiddleware);

// Add CORS middleware - must be configured for SuperTokens
app.use(
  "*",
  cors({
    origin: [process.env.WEBSITE_DOMAIN || "http://localhost:5173"],
    credentials: true,
    allowHeaders: [
      "content-type",
      "traceparent",
      "tracestate",
      ...supertokens.getAllCORSHeaders(),
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Add error handling middleware
app.onError(errorLoggingMiddleware);

// Import supertokens for CORS headers
import supertokens from "supertokens-node";

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
