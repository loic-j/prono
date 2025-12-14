import { HealthResponseSchema } from "@prono/types";
import { z } from "zod";

type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Health check handler
 * Returns the current health status of the server
 */
export const healthHandler = (c: any) => {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return c.json(response, 200);
};
