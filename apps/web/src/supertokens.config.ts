import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

/**
 * SuperTokens Configuration for React Frontend
 * 
 * Initializes SuperTokens with EmailPassword authentication
 * and session management
 */
SuperTokens.init({
  appInfo: {
    appName: "Prono",
    apiDomain: import.meta.env.VITE_API_DOMAIN || "http://localhost:3000",
    websiteDomain: import.meta.env.VITE_WEBSITE_DOMAIN || "http://localhost:5173",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    EmailPassword.init({
      // Optional: customize sign in/up form styles
      style: `
        [data-supertokens~=container] {
          font-family: system-ui;
        }
      `,
    }),
    Session.init(),
  ],
});
