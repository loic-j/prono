import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

/**
 * Initialize OpenTelemetry for distributed tracing with @hono/otel
 * This should be called BEFORE any other imports to ensure auto-instrumentation works
 *
 * @hono/otel will handle Hono-specific instrumentation automatically,
 * this setup handles the core OpenTelemetry SDK configuration
 */
export function initTelemetry() {
  const serviceName = process.env.OTEL_SERVICE_NAME || "prono-api";
  const serviceVersion = process.env.SERVICE_VERSION || "1.0.0";
  // Default to Jaeger's OTLP HTTP endpoint
  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:14318/v1/traces";

  // Create resource with service information
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
  });

  // Configure OTLP exporter
  const traceExporter = new OTLPTraceExporter({
    url: otlpEndpoint,
  });

  // Initialize the SDK
  // Note: @hono/otel middleware will handle Hono-specific tracing
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable HTTP instrumentation as @hono/otel handles it
        "@opentelemetry/instrumentation-http": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-dns": {
          enabled: false, // Usually too noisy
        },
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // Usually too noisy
        },
      }),
    ],
  });

  // Start the SDK
  sdk.start();

  // Gracefully shutdown on process exit
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("OpenTelemetry shut down successfully"))
      .catch((error) =>
        console.error("Error shutting down OpenTelemetry", error)
      )
      .finally(() => process.exit(0));
  });

  console.log(`✅ OpenTelemetry initialized for service: ${serviceName}`);
  console.log(`📡 Exporting traces to: ${otlpEndpoint}`);

  return sdk;
}
