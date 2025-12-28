import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { exampleLoggerHandler } from "../handlers/example.logger.handler";
import { exampleProtectedHandler } from "../handlers/example.protected.handler";
import { authMiddleware } from "../middleware/auth.middleware";

/**
 * Example routes demonstrating various patterns
 * Using standard Hono routes with zValidator middleware
 */
export const exampleRoutes = new Hono();

// Define validation schema
const ExampleValidationSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  role: z.enum(["admin", "user", "guest"]).optional(),
});

// Example validation endpoint using zod-validator
exampleRoutes.post(
  "/examples/validation",
  zValidator("json", ExampleValidationSchema),
  async (c) => {
    const data = c.req.valid("json");
    return c.json(
      {
        message: "Validation successful",
        data,
      },
      200
    );
  }
);

// Example logger endpoint
exampleRoutes.get("/examples/logger", exampleLoggerHandler);

// Example protected endpoint
exampleRoutes.get(
  "/examples/protected",
  authMiddleware,
  exampleProtectedHandler
);

// Example validation with custom business logic
exampleRoutes.post(
  "/examples/validation-custom",
  zValidator("json", ExampleValidationSchema),
  async (c) => {
    const { exampleValidationHandler } = await import(
      "../handlers/example.errors.handler"
    );
    return exampleValidationHandler(c);
  }
);

// Example auth check endpoint (demonstrates auth error handling)
exampleRoutes.get("/examples/auth-check", authMiddleware, async (c) => {
  const { exampleAuthCheckHandler } = await import(
    "../handlers/example.errors.handler"
  );
  return exampleAuthCheckHandler(c);
});
