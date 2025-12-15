/**
 * Dependency Injection Container using TSyringe
 *
 * This module configures the DI container using TSyringe decorators
 * and provides access to the container for resolving dependencies.
 *
 * Architecture:
 * - Infrastructure services are marked with @singleton
 * - Use cases are marked with @injectable and use @inject for dependencies
 * - Container automatically wires everything together
 */

import { container } from "tsyringe";
import { IAuthService, IUserRepository, IEmailService } from "./domain";
import { SuperTokensAuthService } from "./infra/supertokens/auth.adapter";
import { InMemoryUserRepository } from "./infra/repositories/user.repository";
import { ConsoleEmailService } from "./infra/services/email.service";
import {
  RegisterUserUseCase,
  UpdateUserProfileUseCase,
} from "./usecases/example.usecases";

/**
 * Infrastructure Layer Dependencies
 * These are concrete implementations of domain interfaces
 */
export interface InfrastructureServices {
  authService: IAuthService;
  userRepository: IUserRepository;
  emailService: IEmailService;
}

/**
 * Use Case Layer Dependencies
 * These are business logic services that depend on infrastructure
 */
export interface UseCases {
  registerUser: RegisterUserUseCase;
  updateUserProfile: UpdateUserProfileUseCase;
}

/**
 * Complete DI Container
 */
export interface Container {
  infra: InfrastructureServices;
  useCases: UseCases;
}

/**
 * Initialize the DI container
 * This function registers interface-to-implementation mappings
 * and should be called once at application startup
 */
export function initializeContainer(): void {
  // Register interface implementations
  // TSyringe will use the @singleton and @injectable decorators
  // to manage the lifecycle and dependencies automatically

  // Infrastructure services are already registered via @singleton decorators
  // Use cases are already configured via @injectable decorators

  console.log("TSyringe DI container initialized");
}

/**
 * Get the global tsyringe container instance
 */
export function getContainer(): typeof container {
  return container;
}

/**
 * Helper function to get infrastructure services
 */
export function getInfrastructureServices(): InfrastructureServices {
  return {
    authService: container.resolve(SuperTokensAuthService),
    userRepository: container.resolve(InMemoryUserRepository),
    emailService: container.resolve(ConsoleEmailService),
  };
}

/**
 * Helper function to get use cases
 */
export function getUseCases(): UseCases {
  return {
    registerUser: container.resolve(RegisterUserUseCase),
    updateUserProfile: container.resolve(UpdateUserProfileUseCase),
  };
}

/**
 * Reset the container (useful for testing)
 */
export function resetContainer(): void {
  container.clearInstances();
}

// Export the tsyringe container for direct access
export { container };
