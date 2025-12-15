import { singleton } from "tsyringe";
import { IAuthService, SessionInfo, User } from "../../domain";
import supertokens from "supertokens-node";

/**
 * SuperTokens Authentication Adapter
 *
 * Implements the IAuthService interface using SuperTokens
 * This is the infrastructure layer implementation
 */
@singleton()
export class SuperTokensAuthService implements IAuthService {
  /**
   * Get user by ID from SuperTokens
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      // Use the SuperTokens User class to get user info
      const userInfo = await supertokens.getUser(userId);

      if (!userInfo) {
        return null;
      }

      // Get primary email
      const primaryEmail = userInfo.emails[0] || "";

      return new User(
        userInfo.id,
        primaryEmail,
        new Date(userInfo.timeJoined),
        { loginMethods: userInfo.loginMethods }
      );
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  /**
   * Get user from session information
   */
  async getUserFromSession(sessionInfo: SessionInfo): Promise<User | null> {
    return this.getUserById(sessionInfo.userId);
  }

  /**
   * Verify session and return session info
   */
  async verifySession(accessToken: string): Promise<SessionInfo | null> {
    try {
      const { getSession } = await import("supertokens-node/recipe/session");

      // This is a simplified version - in real implementation,
      // you'd pass the actual request object
      // For now, we'll handle this in the middleware
      return null;
    } catch (error) {
      console.error("Error verifying session:", error);
      return null;
    }
  }

  /**
   * Sign out user by revoking session
   */
  async signOut(sessionHandle: string): Promise<void> {
    try {
      const { revokeSession } = await import("supertokens-node/recipe/session");
      await revokeSession(sessionHandle);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new SuperTokensAuthService();
