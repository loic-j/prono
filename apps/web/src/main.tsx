import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SuperTokensWrapper } from "supertokens-auth-react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  getRoutingComponent,
  canHandleRoute,
  getSuperTokensRoutesForReactRouterDom,
} from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import "./index.css";
import "./supertokens.config";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import * as reactRouterDom from "react-router-dom";

function AppWithAuth() {
  // If SuperTokens can handle this route (e.g., /auth), show its UI
  if (canHandleRoute([EmailPasswordPreBuiltUI])) {
    return <div>{getRoutingComponent([EmailPasswordPreBuiltUI])}</div>;
  }

  // Otherwise, show our app (session is optional, not required)
  return (
    <SuperTokensWrapper>
      <BrowserRouter>
        <Routes>
          {/*This renders the login UI on the /auth route*/}
          {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [
            EmailPasswordPreBuiltUI,
          ])}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </SuperTokensWrapper>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithAuth />
  </StrictMode>
);
