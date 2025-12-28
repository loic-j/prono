import { hc } from "hono/client";
import type { AppType } from "../../../api/src/app";

/**
 * Type-safe API client using Hono RPC
 *
 * This provides end-to-end type safety between frontend and backend.
 * TypeScript will auto-complete routes and infer response types.
 */
export const apiClient = hc<AppType>("/", {
  // Include credentials for SuperTokens session management
  init: {
    credentials: "include",
  },
});

const x = await apiClient.api.hello.me.$get();
