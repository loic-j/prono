import { Context, Next } from "hono";
import { getSession } from "supertokens-node/recipe/session";

/**
 * Authentication middleware
 *
 * Verifies that the user has a valid session
 * Attaches the session and user to the context
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Create a compatible request object for SuperTokens
    const request = {
      getHeaderValue: (key: string) => c.req.header(key.toLowerCase()),
      getCookieValue: (key: string) => {
        const cookies = c.req.header("cookie");
        if (!cookies) return undefined;
        const cookie = cookies
          .split(";")
          .find((c) => c.trim().startsWith(key + "="));
        return cookie ? cookie.split("=")[1] : undefined;
      },
      getMethod: () => c.req.method,
      getOriginalURL: () => c.req.url,
    };

    const response = {
      setHeaderValue: (key: string, value: string) => c.header(key, value),
      setCookie: (
        key: string,
        value: string,
        domain: string | undefined,
        secure: boolean,
        httpOnly: boolean,
        expires: number,
        path: string,
        sameSite: string
      ) => {
        let cookie = `${key}=${value}; Path=${path}`;
        if (expires) cookie += `; Expires=${new Date(expires).toUTCString()}`;
        if (domain) cookie += `; Domain=${domain}`;
        if (secure) cookie += "; Secure";
        if (httpOnly) cookie += "; HttpOnly";
        if (sameSite) cookie += `; SameSite=${sameSite}`;
        c.header("Set-Cookie", cookie, { append: true });
      },
      removeHeader: (key: string) => {
        // Not needed for session verification
      },
      setStatusCode: (statusCode: number) => {
        // Not needed for session verification
      },
    };

    const session = await getSession(request as any, response as any, {
      sessionRequired: true,
    });
    c.set("session", session);
    c.set("userId", session.getUserId());

    await next();
  } catch (error: any) {
    if (error.type === "UNAUTHORISED" || error.type === "TRY_REFRESH_TOKEN") {
      return c.json({ error: "Not authenticated. Please log in." }, 401);
    }

    console.error("Auth middleware error:", error);
    return c.json({ error: "Authentication error" }, 500);
  }
};

/**
 * Optional authentication middleware
 *
 * Verifies session if present, but doesn't require it
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const request = {
      getHeaderValue: (key: string) => c.req.header(key.toLowerCase()),
      getCookieValue: (key: string) => {
        const cookies = c.req.header("cookie");
        if (!cookies) return undefined;
        const cookie = cookies
          .split(";")
          .find((c) => c.trim().startsWith(key + "="));
        return cookie ? cookie.split("=")[1] : undefined;
      },
      getMethod: () => c.req.method,
      getOriginalURL: () => c.req.url,
    };

    const response = {
      setHeaderValue: (key: string, value: string) => c.header(key, value),
      setCookie: (
        key: string,
        value: string,
        domain: string | undefined,
        secure: boolean,
        httpOnly: boolean,
        expires: number,
        path: string,
        sameSite: string
      ) => {
        let cookie = `${key}=${value}; Path=${path}`;
        if (expires) cookie += `; Expires=${new Date(expires).toUTCString()}`;
        if (domain) cookie += `; Domain=${domain}`;
        if (secure) cookie += "; Secure";
        if (httpOnly) cookie += "; HttpOnly";
        if (sameSite) cookie += `; SameSite=${sameSite}`;
        c.header("Set-Cookie", cookie, { append: true });
      },
      removeHeader: (key: string) => {},
      setStatusCode: (statusCode: number) => {},
    };

    const session = await getSession(request as any, response as any, {
      sessionRequired: false,
    });
    if (session) {
      c.set("session", session);
      c.set("userId", session.getUserId());
    }
  } catch (error) {
    // Silently fail for optional auth
    console.debug("Optional auth failed:", error);
  }

  await next();
};
