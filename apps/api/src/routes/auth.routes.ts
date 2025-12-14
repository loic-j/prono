import { Hono, Context } from "hono";
import {
  CollectingResponse,
  PreParsedRequest,
  middleware as customMiddleware,
} from "supertokens-node/framework/custom";
import { HTTPMethod } from "supertokens-node/types";
import { serialize } from "cookie";

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

function setCookiesInHeaders(
  headers: Headers,
  cookies: CollectingResponse["cookies"]
) {
  for (const cookie of cookies) {
    headers.append(
      "Set-Cookie",
      serialize(cookie.key, cookie.value, {
        domain: cookie.domain,
        expires: new Date(cookie.expires),
        httpOnly: cookie.httpOnly,
        path: cookie.path,
        sameSite: cookie.sameSite as "strict" | "lax" | "none" | undefined,
        secure: cookie.secure,
      })
    );
  }
}

function copyHeaders(source: Headers, destination: Headers): void {
  for (const [key, value] of source.entries()) {
    destination.append(key, value);
  }
}

export const middleware = () => {
  return async function (c: Context) {
    console.log(`[AUTH] Incoming request: ${c.req.method} ${c.req.url}`);
    console.log(`[AUTH] Path: ${new URL(c.req.url).pathname}`);

    // Parse cookies from cookie header
    const cookieHeader = c.req.header("cookie") || "";
    const cookies: Record<string, string> = {};
    if (cookieHeader) {
      cookieHeader.split(";").forEach((cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          cookies[key] = value;
        }
      });
    }

    const request = new PreParsedRequest({
      method: c.req.method as HTTPMethod,
      url: c.req.url,
      query: Object.fromEntries(new URL(c.req.url).searchParams.entries()),
      cookies,
      headers: c.req.raw.headers as Headers,
      getFormBody: () => c.req.formData(),
      getJSONBody: () => c.req.json(),
    });
    const baseResponse = new CollectingResponse();

    const stMiddleware = customMiddleware(() => request);

    const { handled, error } = await stMiddleware(request, baseResponse);

    if (error) {
      console.error("[AUTH] SuperTokens middleware error:", error);
      throw error;
    }

    if (handled) {
      console.log(`[AUTH] Request handled, status: ${baseResponse.statusCode}`);
      setCookiesInHeaders(baseResponse.headers, baseResponse.cookies);
      return new Response(baseResponse.body, {
        status: baseResponse.statusCode,
        headers: baseResponse.headers,
      });
    }

    console.log("[AUTH] Request not handled by SuperTokens, returning 404");
    return c.json({ error: "Not found" }, 404);
  };
};

// Handle both /auth and /auth/* to catch all authentication endpoints
// Note: These routes are mounted under /api prefix in index.ts, resulting in /api/auth/*
authRoutes.all("/auth", middleware());
authRoutes.all("/auth/*", middleware());
