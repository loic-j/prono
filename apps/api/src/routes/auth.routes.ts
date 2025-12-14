import { Hono } from "hono";
import { middleware } from "supertokens-node/framework/custom";
import { verifySession } from "supertokens-node/recipe/session/framework/custom";
import {
  getCurrentUserHandler,
  signOutHandler,
} from "../handlers/auth.handler";
import Session from "supertokens-node/recipe/session";

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

// SuperTokens middleware to handle auth requests
authRoutes.all("*", async (c, next) => {
  const baseRequest = {
    getMethod: () => c.req.method,
    getQuery: () => {
      const url = new URL(c.req.url);
      const query: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      return query;
    },
    getJSONBody: async () => {
      try {
        return await c.req.json();
      } catch {
        return {};
      }
    },
    getFormData: async () => {
      try {
        const formData = await c.req.formData();
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
          data[key] = value.toString();
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
        .find((c) => c.trim().startsWith(key + "="));
      return cookie ? cookie.split("=")[1] : undefined;
    },
    setHeaderValue: (key: string, value: string) => {
      c.header(key, value);
    },
    setCookie: (
      key: string,
      value: string,
      expires: number,
      path: string,
      domain: string,
      secure: boolean,
      httpOnly: boolean,
      sameSite: string
    ) => {
      let cookie = `${key}=${value}; Path=${path}`;
      if (expires) cookie += `; Expires=${new Date(expires).toUTCString()}`;
      if (domain) cookie += `; Domain=${domain}`;
      if (secure) cookie += "; Secure";
      if (httpOnly) cookie += "; HttpOnly";
      if (sameSite) cookie += `; SameSite=${sameSite}`;
      c.header("Set-Cookie", cookie);
    },
  };

  const baseResponse = {
    setHeaderValue: (key: string, value: string) => {
      c.header(key, value);
    },
    sendHTMLResponse: (html: string) => {
      return c.html(html);
    },
    setStatusCode: (statusCode: number) => {
      c.status(statusCode as any);
    },
    sendJSONResponse: (json: any) => {
      return c.json(json);
    },
  };

  try {
    await middleware()(baseRequest as any, baseResponse as any);

    // If SuperTokens didn't handle the request, continue
    if (!c.res.headers.get("content-type")) {
      await next();
    }
  } catch (error) {
    console.error("SuperTokens middleware error:", error);
    await next();
  }
});

// Custom endpoint: Get current user
authRoutes.get("/user", async (c) => {
  try {
    const session = await Session.getSession(c.req.raw, c.res as any);
    (c as any).set("session", session);
    return getCurrentUserHandler(c);
  } catch (error: any) {
    return c.json({ error: "Not authenticated" }, 401);
  }
});

// Custom endpoint: Sign out
authRoutes.post("/signout", async (c) => {
  try {
    const session = await Session.getSession(c.req.raw, c.res as any);
    (c as any).set("session", session);
    return signOutHandler(c);
  } catch (error: any) {
    return c.json({ error: "Not authenticated" }, 401);
  }
});
