import supertokens from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import ThirdParty from "supertokens-node/recipe/thirdparty";
import Session from "supertokens-node/recipe/session";

/**
 * SuperTokens Configuration
 *
 * Initializes SuperTokens with EmailPassword, ThirdParty (Google), and Session recipes
 */
export function initSuperTokens() {
  supertokens.init({
    framework: "custom", // We're using Hono, not Express
    supertokens: {
      // Using local SuperTokens core for development
      // For production, use SuperTokens managed service or self-hosted
      connectionURI:
        process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:3567",
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo: {
      appName: "Prono",
      apiDomain: process.env.API_DOMAIN || "http://localhost:3000",
      websiteDomain: process.env.WEBSITE_DOMAIN || "http://localhost:5173",
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      // Email/Password authentication
      EmailPassword.init(),

      // Third-party authentication (Google, GitHub, etc.)
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            // Google OAuth
            {
              config: {
                thirdPartyId: "google",
                clients: [
                  {
                    clientId: process.env.GOOGLE_CLIENT_ID || "",
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                  },
                ],
              },
            },
            // You can add more providers here (GitHub, Apple, etc.)
          ],
        },
      }),

      // Session management
      Session.init({
        cookieSameSite: "lax",
        cookieSecure: process.env.NODE_ENV === "production",
      }),
    ],
  });
}
