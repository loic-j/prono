import { useState } from "react";
import { Link } from "react-router-dom";
import type { HelloResponse } from "@prono/types";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { signOut } from "supertokens-auth-react/recipe/emailpassword";
import { redirectToAuth } from "supertokens-auth-react";

function Dashboard() {
  const [protectedMessage, setProtectedMessage] = useState<string>("");
  const [protectedLoading, setProtectedLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Get session context to check if user is logged in
  const session = useSessionContext();

  const isLoggedIn = !session.loading && session.doesSessionExist !== false;

  // Fetch protected personalized greeting
  const fetchProtectedGreeting = async () => {
    setProtectedLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hello/me", {
        credentials: "include", // Important: include cookies for session
      });

      if (res.status === 401) {
        setError("Not authenticated. Please log in.");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: HelloResponse = await res.json();
      setProtectedMessage(data.message);
    } catch (error) {
      console.error("Error fetching protected greeting:", error);
      setError("Failed to fetch protected greeting");
    } finally {
      setProtectedLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setProtectedMessage("");
    setError("");
  };

  const handleSignIn = () => {
    redirectToAuth();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>📊 Dashboard</h1>

      <nav style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        <Link to="/dashboard" style={{ marginRight: "1rem" }}>
          Dashboard
        </Link>
        <Link to="/about">About</Link>
      </nav>

      {/* Authentication Status */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: session.loading
            ? "#f0f0f0"
            : isLoggedIn
            ? "#d4edda"
            : "#f8d7da",
          borderRadius: "8px",
        }}
      >
        <h3>Authentication Status</h3>
        {session.loading ? (
          <p>Checking session...</p>
        ) : isLoggedIn ? (
          <div>
            <p style={{ color: "#155724" }}>✅ Logged in</p>
            <button
              onClick={handleSignOut}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                cursor: "pointer",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginTop: "0.5rem",
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: "#721c24" }}>❌ Not logged in</p>
            <button
              onClick={handleSignIn}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                cursor: "pointer",
                background: "#007acc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginTop: "0.5rem",
              }}
            >
              Sign In / Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Protected Endpoint */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#e7f3ff",
          borderRadius: "8px",
          border: "2px solid #007acc",
        }}
      >
        <h2>🔒 Protected API Message:</h2>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
          This endpoint requires authentication
        </p>
        {error && (
          <p style={{ color: "#dc3545", marginBottom: "1rem" }}>{error}</p>
        )}
        {protectedMessage && (
          <p
            style={{
              fontSize: "1.5rem",
              color: "#007acc",
              marginBottom: "1rem",
            }}
          >
            {protectedMessage}
          </p>
        )}
        <button
          onClick={fetchProtectedGreeting}
          disabled={!isLoggedIn || protectedLoading}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: isLoggedIn ? "pointer" : "not-allowed",
            background: isLoggedIn ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            opacity: isLoggedIn ? 1 : 0.6,
          }}
        >
          {protectedLoading
            ? "Loading..."
            : "Fetch Personalized Greeting (Protected)"}
        </button>
        {!isLoggedIn && (
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
            Please sign in to access this endpoint
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
