import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { HealthResponseSchema } from "@prono/types";
import { healthHandler } from "../handlers/health.handler";

/**
 * Health check routes
 * Provides endpoints for monitoring server health
 */
export const healthRoutes = new OpenAPIHono();

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

healthRoutes.openapi(healthRoute, (c) => healthHandler(c));
