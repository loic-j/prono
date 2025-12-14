import { HelloResponseSchema, HelloNameParamSchema } from "@prono/types";
import { z } from "zod";

type HelloResponse = z.infer<typeof HelloResponseSchema>;
type HelloNameParam = z.infer<typeof HelloNameParamSchema>;

/**
 * Simple hello world handler
 * Returns a basic greeting message
 */
export const helloHandler = (c: any) => {
  const response: HelloResponse = {
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  };

  return c.json(response, 200);
};

/**
 * Personalized greeting handler
 * Returns a greeting message with the provided name
 *
 * Performs syntactic validation on the name parameter
 */
export const helloNameHandler = (c: any) => {
  const { name } = c.req.valid("param") as HelloNameParam;

  // Syntactic validation is already done by Zod via the route schema
  // Additional validation could be added here if needed (e.g., length, format)

  const response: HelloResponse = {
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
  };

  return c.json(response, 200);
};
