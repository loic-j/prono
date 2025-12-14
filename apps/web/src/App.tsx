import { useState, useEffect } from "react";
import { hc } from "hono/client";
import type { AppType } from "../../api/src/app";

// Create Hono RPC client with type safety
const client = hc<AppType>("/api");

function App() {
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState<string>("World");
  const [loading, setLoading] = useState(false);

  const fetchHello = async () => {
    setLoading(true);
    try {
      const res = await client.hello.$get();
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHelloWithName = async () => {
    setLoading(true);
    try {
      const res = await client.hello[":name"].$get({
        param: { name },
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHello();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>🚀 Hono + React Monorepo</h1>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Message from API:</h2>
        <p style={{ fontSize: "1.5rem", color: "#333" }}>
          {loading ? "Loading..." : message || "No message yet"}
        </p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={fetchHello}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
            background: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Fetch Hello
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            marginRight: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={fetchHelloWithName}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Say Hello
        </button>
      </div>

      <div style={{ marginTop: "2rem", color: "#666" }}>
        <p>✅ Type-safe API calls with Hono RPC</p>
        <p>✅ React + Vite frontend</p>
        <p>✅ Monorepo with pnpm workspaces</p>
      </div>
    </div>
  );
}

export default App;
