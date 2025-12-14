import { User } from "./user.entity";

/**
 * Session information
 */
export interface SessionInfo {
  userId: string;
  sessionHandle: string;
  accessTokenPayload: Record<string, any>;
}

/**
 * Authentication Port (Interface)
 *
 * Defines the contract that authentication infrastructure must implement
 * This allows the domain to be independent of the specific auth provider
 */
export interface IAuthService {
  /**
   * Get user by ID
   */
  getUserById(userId: string): Promise<User | null>;

  /**
   * Get user from session
   */
  getUserFromSession(sessionInfo: SessionInfo): Promise<User | null>;

  /**
   * Verify session exists and is valid
   */
  verifySession(accessToken: string): Promise<SessionInfo | null>;

  /**
   * Sign out user
   */
  signOut(sessionHandle: string): Promise<void>;
}
