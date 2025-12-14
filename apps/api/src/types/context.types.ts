import { User } from "../domain/user.entity";
import { SessionContainer } from "supertokens-node/recipe/session";
import { Container } from "../container";

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
 * Hono context with authentication and DI container
 * Use this type to access authenticated user information and dependencies in handlers
 */
export type AppContext = {
  Variables: Partial<AuthenticatedContext> & {
    container: Container;
  };
};
