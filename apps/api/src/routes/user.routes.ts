/**
 * User Routes (Demonstrating DI)
 *
 * These routes show how to use the DI container in practice
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import {
  registerUserHandler,
  updateUserProfileHandler,
} from "../handlers/user.handler";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRoutes = new OpenAPIHono();

/**
 * POST /users/register
 * Register a new user (demonstrates use case injection)
 */
userRoutes.openapi(
  {
    method: "post",
    path: "/users/register",
    tags: ["Users"],
    summary: "Register a new user",
    description:
      "Create a new user account. Demonstrates dependency injection with use cases.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email(),
              password: z.string().min(8),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: z.object({
              id: z.string(),
              email: z.string(),
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: "Validation error",
      },
      409: {
        description: "User already exists",
      },
    },
  },
  registerUserHandler
);

/**
 * PATCH /users/profile
 * Update user profile (demonstrates use case injection with auth)
 */
userRoutes.openapi(
  {
    method: "patch",
    path: "/users/profile",
    tags: ["Users"],
    summary: "Update user profile",
    description:
      "Update the authenticated user's profile. Requires authentication.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              displayName: z.string().min(2).optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Profile updated successfully",
        content: {
          "application/json": {
            schema: z.object({
              id: z.string(),
              email: z.string(),
              displayName: z.string().optional(),
              message: z.string(),
            }),
          },
        },
      },
      401: {
        description: "Not authenticated",
      },
      400: {
        description: "Validation error",
      },
    },
  },
  updateUserProfileHandler
);

// Apply auth middleware to protected routes
userRoutes.use("/users/profile", authMiddleware);
