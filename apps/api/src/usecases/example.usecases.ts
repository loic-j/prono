/**
 * Example use cases demonstrating error handling in clean architecture
 *
 * These examples show how to properly throw domain errors in business logic
 * and let the Hono error handler deal with HTTP responses
 */

import {
  ValidationError,
  ConflictError,
  NotFoundError,
} from "../domain/errors";
import { IUserRepository, IEmailService } from "../domain";

/**
 * Example: User registration use case
 */
export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string, password: string) {
    // Validation - throw ValidationError
    if (!this.isValidEmail(email)) {
      throw new ValidationError("Invalid email format", { email });
    }

    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters", {
        minLength: 8,
        providedLength: password.length,
      });
    }

    // Business rule - check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists", {
        email,
      });
    }

    // Create user
    const user = await this.userRepository.create({ email, password });

    // Send verification email with a temporary token
    // In production, generate a proper verification token
    const verificationToken = `verify_${user.id}_${Date.now()}`;
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken
    );

    return user;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

/**
 * Example: Update user profile use case
 */
export class UpdateUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, updates: { displayName?: string }) {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found", { userId });
    }

    // Validate updates
    if (updates.displayName !== undefined) {
      if (updates.displayName.length < 2) {
        throw new ValidationError(
          "Display name must be at least 2 characters",
          {
            minLength: 2,
            providedLength: updates.displayName.length,
          }
        );
      }
    }

    // Update user
    const updatedUser = await this.userRepository.update(userId, updates);

    return updatedUser;
  }
}
