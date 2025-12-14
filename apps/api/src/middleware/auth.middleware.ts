import { Context, Next } from "hono";
import { getSession } from "supertokens-node/recipe/session";
import { authService } from "../infra/supertokens";
import { AuthenticatedContext } from "../types/context.types";

/**
 * Authentication middleware
 *
 * Verifies that the user has a valid session
 * Attaches the session, userId, and full user object to the context
 */
export const authMiddleware = async (
  c: Context<{ Variables: AuthenticatedContext }>,
  next: Next
) => {
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

    const userId = session.getUserId();

    // Fetch full user information
    const user = await authService.getUserById(userId);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Set all authenticated context variables with type safety
    c.set("session", session);
    c.set("userId", userId);
    c.set("user", user);

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
export const optionalAuthMiddleware = async (
  c: Context<{ Variables: AuthenticatedContext }>,
  next: Next
) => {
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
      const userId = session.getUserId();
      const user = await authService.getUserById(userId);

      if (user) {
        c.set("session", session);
        c.set("userId", userId);
        c.set("user", user);
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.debug("Optional auth failed:", error);
  }

  await next();
};
