import { z } from "zod";
import { extendZodWithOpenApi } from "@hono/zod-openapi";

// Extend Zod with OpenAPI features
extendZodWithOpenApi(z);

// ============================================================================
// Health Check Schemas
// ============================================================================

export const HealthResponseSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  timestamp: z
    .string()
    .datetime()
    .openapi({ example: "2025-12-14T10:00:00.000Z" }),
  uptime: z.number().openapi({ example: 123.45 }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// ============================================================================
// Hello Schemas
// ============================================================================

export const HelloResponseSchema = z.object({
  message: z.string().openapi({ example: "Hello World!" }),
  timestamp: z
    .string()
    .datetime()
    .openapi({ example: "2025-12-14T10:00:00.000Z" }),
});

export type HelloResponse = z.infer<typeof HelloResponseSchema>;

// ============================================================================
// Error Schemas
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({ example: "Bad Request" }),
  message: z.string().openapi({ example: "Invalid input provided" }),
  details: z
    .record(z.string(), z.any())
    .optional()
    .openapi({
      example: { field: "name", issue: "required" },
    }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============================================================================
// Export all schemas
// ============================================================================

export const schemas = {
  HealthResponseSchema,
  HelloResponseSchema,
  ErrorResponseSchema,
};
