// Initialize reflect-metadata FIRST for tsyringe decorators
import "reflect-metadata";

// Initialize OpenTelemetry SECOND, before any other imports
import { initTelemetry } from "./infra/telemetry";
initTelemetry();

import { serve } from "@hono/node-server";
import app from "./app";
import { logger } from "./utils/logger";

const port = Number(process.env.PORT) || 3000;

logger.info({ port }, "Server starting");

serve({
  fetch: app.fetch,
  port,
});
