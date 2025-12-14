/**
 * User Domain Entity
 *
 * Represents a user in the system with business rules
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly timeJoined: Date,
    public readonly metadata?: Record<string, any>
  ) {}

  /**
   * Get user's display name
   * Returns email username if no name is provided in metadata
   */
  getDisplayName(): string {
    if (this.metadata?.firstName && this.metadata?.lastName) {
      return `${this.metadata.firstName} ${this.metadata.lastName}`;
    }
    if (this.metadata?.firstName) {
      return this.metadata.firstName;
    }
    // Extract name from email
    return this.email.split("@")[0];
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    return this.metadata?.emailVerified === true;
  }
}
