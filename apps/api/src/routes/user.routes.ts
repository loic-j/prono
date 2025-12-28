/**
 * User Routes (Demonstrating DI)
 *
 * These routes show how to use the DI container in practice
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  RegisterUserRequestSchema,
  UpdateUserProfileRequestSchema,
} from "@prono/types";
import {
  registerUserHandler,
  updateUserProfileHandler,
} from "../handlers/user.handler";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRoutes = new Hono();

/**
 * POST /users/register
 * Register a new user (demonstrates use case injection)
 */
userRoutes.post(
  "/users/register",
  zValidator("json", RegisterUserRequestSchema),
  registerUserHandler
);

/**
 * PATCH /users/profile
 * Update user profile (demonstrates use case injection with auth)
 */
userRoutes.patch(
  "/users/profile",
  authMiddleware,
  zValidator("json", UpdateUserProfileRequestSchema),
  updateUserProfileHandler
);
