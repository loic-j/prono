import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { getRoutingComponent, canHandleRoute } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import App from "./App";
import "./index.css";
import "./supertokens.config";

function AppWithAuth() {
  // If SuperTokens can handle this route (e.g., /auth), show its UI
  if (canHandleRoute([EmailPasswordPreBuiltUI])) {
    return <div>{getRoutingComponent([EmailPasswordPreBuiltUI])}</div>;
  }

  // Otherwise, show our app with session management
  return (
    <SuperTokensWrapper>
      <SessionAuth>
        <App />
      </SessionAuth>
    </SuperTokensWrapper>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithAuth />
  </StrictMode>
);
