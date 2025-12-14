import { Context, Next } from "hono";
import { getSession } from "supertokens-node/recipe/session";
import { authService } from "../infra/supertokens";
import { AuthenticatedContext } from "../types/context.types";
import {
  InvalidSessionError,
  SessionRefreshRequiredError,
  UserNotFoundError,
  SuperTokensError,
} from "../domain/errors";

/**
 * Authentication middleware
 *
 * Verifies that the user has a valid session
 * Attaches the session, userId, and full user object to the context
 * Throws errors instead of returning responses - let Hono's error handler deal with them
 */
export const authMiddleware = async (
  c: Context<{ Variables: AuthenticatedContext }>,
  next: Next
) => {
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

  try {
    const session = await getSession(request as any, response as any, {
      sessionRequired: true,
    });

    const userId = session.getUserId();

    // Fetch full user information
    const user = await authService.getUserById(userId);

    if (!user) {
      throw new UserNotFoundError(userId, "Authenticated user not found");
    }

    // Set all authenticated context variables with type safety
    c.set("session", session);
    c.set("userId", userId);
    c.set("user", user);

    await next();
  } catch (error: any) {
    // Map SuperTokens errors to domain errors
    if (error.type === "UNAUTHORISED") {
      throw new InvalidSessionError("Not authenticated. Please log in.");
    }

    if (error.type === "TRY_REFRESH_TOKEN") {
      throw new SessionRefreshRequiredError(
        "Session expired. Please refresh your token."
      );
    }

    // If it's already one of our custom errors, rethrow it
    if (error.name && error.name.endsWith("Error") && error.statusCode) {
      throw error;
    }

    // Unknown SuperTokens or infrastructure error
    throw new SuperTokensError("Authentication service error", {
      originalError: error.message,
    });
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
