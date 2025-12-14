import { OpenAPIHono } from "@hono/zod-openapi";
import { healthRoutes } from "./health.routes";
import { greetingRoutes } from "./greeting.routes";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";

/**
 * Main router that combines all route modules
 */
export const createRoutes = () => {
  const app = new OpenAPIHono();

  // Mount health routes at root level
  app.route("/", healthRoutes);

  // Mount greeting, auth, and user routes under /api prefix
  const api = new OpenAPIHono();
  api.route("/", greetingRoutes);
  api.route("/", authRoutes);
  api.route("/", userRoutes);
  app.route("/api", api);

  return app;
};
