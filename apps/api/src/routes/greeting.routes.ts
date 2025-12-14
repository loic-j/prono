import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { HelloResponseSchema, ErrorResponseSchema } from "@prono/types";
import { helloHandler, helloNameHandler } from "../handlers/greeting.handler";
import { authMiddleware } from "../middleware/auth.middleware";
import { Context } from "hono";
import { AuthenticatedContext } from "../types/context.types";

/**
 * Greeting routes
 * Provides greeting endpoints for demonstration purposes
 */
export const greetingRoutes = new OpenAPIHono();

// Hello World endpoint (public)
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

greetingRoutes.openapi(helloRoute, (c) => helloHandler(c));

// Personalized greeting endpoint (protected)
const helloNameRoute = createRoute({
  method: "get",
  path: "/hello/me",
  tags: ["Greetings"],
  summary: "Personalized greeting (Protected)",
  description:
    "Returns a personalized greeting message using the authenticated user's name. Requires authentication.",
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: HelloResponseSchema,
        },
      },
    },
    401: {
      description: "Not authenticated",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Apply the handler with auth middleware inline
greetingRoutes.openapi(helloNameRoute, async (c) => {
  await authMiddleware(c as any, async () => {});
  return helloNameHandler(c as any);
});
