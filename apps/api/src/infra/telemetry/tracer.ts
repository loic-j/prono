import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

/**
 * Initialize OpenTelemetry for distributed tracing
 * This should be called BEFORE any other imports to ensure auto-instrumentation works
 */
export function initTelemetry() {
  const serviceName = process.env.OTEL_SERVICE_NAME || "prono-api";
  const serviceVersion = process.env.SERVICE_VERSION || "1.0.0";
  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces";

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
  const sdk = new NodeSDK({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
    instrumentations: [
      getNodeAutoInstrumentations({
        // Auto-instrument HTTP, Express, and other common libraries
        "@opentelemetry/instrumentation-http": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-express": {
          enabled: true,
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
