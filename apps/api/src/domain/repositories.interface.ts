/**
 * User Repository Interface (Port)
 *
 * Defines the contract for user data persistence
 * Infrastructure layer will provide concrete implementations
 */

import { User } from "./user.entity";

/**
 * Data structure for creating a new user
 */
export interface CreateUserDto {
  email: string;
  password: string;
}

/**
 * Data structure for updating user information
 */
export interface UpdateUserDto {
  email?: string;
  displayName?: string;
}

/**
 * User Repository Port
 *
 * This interface defines how the domain layer interacts with user data storage
 * The infrastructure layer provides the actual implementation
 */
export interface IUserRepository {
  /**
   * Find a user by their unique ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create a new user
   */
  create(data: CreateUserDto): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, data: UpdateUserDto): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a user exists by email
   */
  existsByEmail(email: string): Promise<boolean>;
}

/**
 * Email Service Interface (Port)
 *
 * Defines the contract for sending emails
 * Infrastructure layer will provide concrete implementations
 */
export interface IEmailService {
  /**
   * Send a verification email to a user
   */
  sendVerificationEmail(
    email: string,
    verificationToken: string
  ): Promise<void>;

  /**
   * Send a password reset email
   */
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;

  /**
   * Send a welcome email to a new user
   */
  sendWelcomeEmail(email: string, displayName?: string): Promise<void>;
}
