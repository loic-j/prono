import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Enable CORS for frontend
app.use("/*", cors());

// Hello world route
app.get("/", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

// API routes
const api = new Hono();

api.get("/hello", (c) => {
  return c.json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  });
});

api.get("/hello/:name", (c) => {
  const name = c.req.param("name");
  return c.json({
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

app.route("/api", api);

// Export the app type for RPC
export type AppType = typeof api;

export default app;
