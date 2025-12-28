import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  CurrentUserResponseSchema,
  SignOutResponseSchema,
  ErrorResponseSchema,
} from "@prono/types";
import {
  getCurrentUserHandler,
  signOutHandler,
} from "../handlers/auth.handler";
import { authMiddleware } from "../middleware/auth.middleware";

/**
 * Custom authentication routes (non-SuperTokens endpoints)
 * Provides additional auth-related endpoints
 */
export const authCustomRoutes = new OpenAPIHono();

// Get current user endpoint (protected)
const getCurrentUserRoute = createRoute({
  method: "get",
  path: "/auth/me",
  tags: ["Authentication"],
  summary: "Get current user (Protected)",
  description:
    "Returns the currently authenticated user's information. Requires authentication.",
  responses: {
    200: {
      description: "User information retrieved successfully",
      content: {
        "application/json": {
          schema: CurrentUserResponseSchema,
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
  },
});

// Sign out endpoint (protected)
const signOutRoute = createRoute({
  method: "post",
  path: "/auth/signout",
  tags: ["Authentication"],
  summary: "Sign out (Protected)",
  description:
    "Signs out the current user by revoking their session. Requires authentication.",
  responses: {
    200: {
      description: "Signed out successfully",
      content: {
        "application/json": {
          schema: SignOutResponseSchema,
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
  },
});

// Apply routes with auth middleware
authCustomRoutes.openapi(getCurrentUserRoute, async (c) => {
  await authMiddleware(c as any, async () => {});
  return getCurrentUserHandler(c as any);
});

authCustomRoutes.openapi(signOutRoute, async (c) => {
  await authMiddleware(c as any, async () => {});
  return signOutHandler(c as any);
});
