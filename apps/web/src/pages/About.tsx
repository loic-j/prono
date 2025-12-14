import { Link } from "react-router-dom";

function About() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>ℹ️ About</h1>

      <nav style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ marginRight: "1rem" }}>
          Dashboard
        </Link>
        <Link to="/about">About</Link>
      </nav>

      <div style={{ marginTop: "2rem", maxWidth: "600px" }}>
        <h2>About This Application</h2>
        <p style={{ lineHeight: "1.6", color: "#333" }}>
          This is a modern full-stack application built with:
        </p>
        <ul style={{ lineHeight: "1.8", color: "#555" }}>
          <li>
            <strong>Frontend:</strong> React + Vite + TypeScript + React Router
          </li>
          <li>
            <strong>Backend:</strong> Hono + TypeScript
          </li>
          <li>
            <strong>Authentication:</strong> SuperTokens
          </li>
          <li>
            <strong>Monorepo:</strong> pnpm workspaces
          </li>
          <li>
            <strong>Type Safety:</strong> Shared types package
          </li>
        </ul>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <h3>Features</h3>
          <ul style={{ lineHeight: "1.8" }}>
            <li>✅ Client-side routing with React Router</li>
            <li>✅ Protected routes requiring authentication</li>
            <li>✅ Public and private API endpoints</li>
            <li>✅ Session management with SuperTokens</li>
            <li>✅ Type-safe API communication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
