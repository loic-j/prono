import { User } from "../domain/user.entity";
import { SessionContainer } from "supertokens-node/recipe/session";

/**
 * Authenticated context variables
 * These are set by the auth middleware when a user is authenticated
 */
export interface AuthenticatedContext {
  session: SessionContainer;
  userId: string;
  user: User;
}

/**
 * Hono context with authentication
 * Use this type to access authenticated user information in handlers
 */
export type AppContext = {
  Variables: Partial<AuthenticatedContext>;
};
