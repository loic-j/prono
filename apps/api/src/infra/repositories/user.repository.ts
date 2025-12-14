/**
 * In-Memory User Repository Implementation
 *
 * This is a simple in-memory implementation for development/testing
 * In production, replace this with a proper database implementation (e.g., Prisma, TypeORM)
 */

import {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
  User,
} from "../../domain";

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId mapping

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async create(data: CreateUserDto): Promise<User> {
    // Generate a simple ID (in production, use UUID or database-generated ID)
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = new User(id, data.email, new Date(), {
      hashedPassword: data.password, // In production, hash the password!
    });

    this.users.set(id, user);
    this.emailIndex.set(data.email.toLowerCase(), id);

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Update email index if email changed
    if (data.email && data.email !== user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.emailIndex.set(data.email.toLowerCase(), id);
    }

    // Create updated user (User is immutable, so we create a new instance)
    const updatedUser = new User(
      user.id,
      data.email || user.email,
      user.timeJoined,
      {
        ...user.metadata,
        displayName: data.displayName,
      }
    );

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.users.delete(id);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.emailIndex.has(email.toLowerCase());
  }

  /**
   * Clear all users (useful for testing)
   */
  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
  }

  /**
   * Get total number of users (useful for testing/debugging)
   */
  count(): number {
    return this.users.size;
  }
}
