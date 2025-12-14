import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  HelloResponseSchema,
  HelloNameParamSchema,
  ErrorResponseSchema,
} from "@prono/types";
import { helloHandler, helloNameHandler } from "../handlers/greeting.handler";

/**
 * Greeting routes
 * Provides greeting endpoints for demonstration purposes
 */
export const greetingRoutes = new OpenAPIHono();

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

greetingRoutes.openapi(helloRoute, (c) => helloHandler(c));

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

greetingRoutes.openapi(helloNameRoute, (c) => helloNameHandler(c));
