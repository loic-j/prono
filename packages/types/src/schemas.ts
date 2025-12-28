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
// User Schemas
// ============================================================================

export const RegisterUserRequestSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(8).openapi({ example: "securePass123!" }),
});

export const RegisterUserResponseSchema = z.object({
  id: z.string().openapi({ example: "user_123456" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  message: z.string().openapi({ example: "User registered successfully" }),
});

export const UpdateUserProfileRequestSchema = z.object({
  displayName: z.string().min(2).optional().openapi({ example: "John Doe" }),
});

export const UpdateUserProfileResponseSchema = z.object({
  id: z.string().openapi({ example: "user_123456" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  displayName: z.string().optional().openapi({ example: "John Doe" }),
  message: z.string().openapi({ example: "Profile updated successfully" }),
});

export const CurrentUserResponseSchema = z.object({
  id: z.string().openapi({ example: "user_123456" }),
  email: z.string().email().openapi({ example: "user@example.com" }),
  displayName: z.string().openapi({ example: "John Doe" }),
  timeJoined: z.number().openapi({ example: 1640000000000 }),
  isVerified: z.boolean().openapi({ example: true }),
});

export const SignOutResponseSchema = z.object({
  message: z.string().openapi({ example: "Signed out successfully" }),
});

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
  RegisterUserRequestSchema,
  RegisterUserResponseSchema,
  UpdateUserProfileRequestSchema,
  UpdateUserProfileResponseSchema,
  CurrentUserResponseSchema,
  SignOutResponseSchema,
};
