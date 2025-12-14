import { Context } from "hono";
import { logger, withLogging } from "../utils/logger";

/**
 * Example handler demonstrating logger usage
 * This shows best practices for logging in handlers
 */
export const exampleLoggerHandler = async (c: Context) => {
  // 1. Simple info log with context
  logger.info({ endpoint: "example-logger" }, "Handling example request");

  // 2. Log with structured data
  const userId = c.req.query("userId");
  if (userId) {
    logger.debug({ userId }, "Processing request for user");
  }

  // 3. Using withLogging for traced operations
  try {
    const data = await withLogging(
      "fetch-example-data",
      async () => {
        // Simulate some async work
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { example: "data", timestamp: new Date().toISOString() };
      },
      { userId } // Additional context
    );

    logger.info({ data }, "Successfully processed request");

    return c.json({ success: true, data }, 200);
  } catch (error) {
    // Error logging with trace context
    logger.error({ error, userId }, "Failed to process request");
    return c.json({ error: "Internal server error" }, 500);
  }
};
