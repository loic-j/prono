import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { HelloResponse } from "@prono/types";

function Home() {
  const [message, setMessage] = useState<string>("");
  const [name, setName] = useState<string>("World");
  const [loading, setLoading] = useState(false);

  const fetchHello = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hello");
      const data: HelloResponse = await res.json();
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
      const res = await fetch(`/api/hello/${encodeURIComponent(name)}`);
      const data: HelloResponse = await res.json();
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
      <h1>🚀 Hono + React Monorepo with Auth</h1>

      <nav style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ marginRight: "1rem" }}>
          Dashboard
        </Link>
        <Link to="/about">About</Link>
      </nav>

      {/* Public Endpoint */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Public API Message:</h2>
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
        <p>✅ SuperTokens authentication</p>
        <p>✅ React Router navigation</p>
      </div>
    </div>
  );
}

export default Home;
