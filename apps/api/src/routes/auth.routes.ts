import { Hono, Context } from "hono";
import { middleware } from "supertokens-node/framework/custom";

/**
 * Authentication routes
 *
 * Provides endpoints for authentication using SuperTokens
 * SuperTokens automatically creates endpoints like:
 * - POST /auth/signup (email/password)
 * - POST /auth/signin (email/password)
 * - POST /auth/signinup (third-party)
 */
export const authRoutes = new Hono();

// Shared handler for SuperTokens middleware
const handleSupertokensRequest = async (c: Context) => {
  console.log(`[AUTH] Handling ${c.req.method} ${new URL(c.req.url).pathname}`);

  let responseSent = false;
  let statusCode = 200;
  const responseHeaders: Record<string, string> = {};
  let responseContent: any = null;
  let responseType: string = "json";

  // Cache request body since it can only be read once
  let cachedBody: any = null;

  const baseRequest = {
    getMethod: () => c.req.method,
    getQuery: () => {
      const url = new URL(c.req.url);
      const query: Record<string, string> = {};
      url.searchParams.forEach((value: string, key: string) => {
        query[key] = value;
      });
      return query;
    },
    getJSONBody: async () => {
      if (cachedBody !== null) return cachedBody;
      try {
        const text = await c.req.text();
        cachedBody = text ? JSON.parse(text) : {};
        console.log(`[AUTH] Parsed JSON body:`, cachedBody);
        return cachedBody;
      } catch (e) {
        console.error(`[AUTH] Error parsing body:`, e);
        return {};
      }
    },
    getFormData: async () => {
      try {
        const formData: FormData = await c.req.formData();
        const data: Record<string, string> = {};
        formData.forEach((value: string | File, key: string) => {
          data[key] = typeof value === "string" ? value : value.name;
        });
        return data;
      } catch {
        return {};
      }
    },
    getHeaderValue: (key: string) => c.req.header(key) || undefined,
    getOriginalURL: () => c.req.url,
    getPath: () => new URL(c.req.url).pathname,
    getCookieValue: (key: string) => {
      const cookies = c.req.header("cookie");
      if (!cookies) return undefined;
      const cookie = cookies
        .split(";")
        .find((cookieStr: string) => cookieStr.trim().startsWith(key + "="));
      return cookie ? cookie.split("=")[1] : undefined;
    },
  };

  const baseResponse = {
    setHeaderValue: (key: string, value: string) => {
      responseHeaders[key] = value;
    },
    sendHTMLResponse: (html: string) => {
      responseSent = true;
      responseContent = html;
      responseType = "html";
    },
    setStatusCode: (code: number) => {
      statusCode = code;
    },
    sendJSONResponse: (json: any) => {
      responseSent = true;
      responseContent = json;
      responseType = "json";
    },
  };

  try {
    console.log(`[AUTH] Calling SuperTokens middleware...`);
    await middleware()(baseRequest as any, baseResponse as any);
    console.log(`[AUTH] Middleware returned, responseSent: ${responseSent}`);

    if (responseSent) {
      // Apply headers
      Object.entries(responseHeaders).forEach(([key, value]) => {
        c.header(key, value);
      });

      // Set status
      c.status(statusCode as any);

      console.log(
        `[AUTH] Sending ${responseType} response with status ${statusCode}`
      );

      // Send response
      if (responseType === "html") {
        return c.html(responseContent);
      } else {
        return c.json(responseContent);
      }
    }

    // If SuperTokens didn't handle it, return 404
    console.log(`[AUTH] SuperTokens didn't handle the request`);
    return c.json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("SuperTokens middleware error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Handle both /auth and /auth/* to catch all authentication endpoints
authRoutes.all("/auth", handleSupertokensRequest);
authRoutes.all("/auth/*", handleSupertokensRequest);
