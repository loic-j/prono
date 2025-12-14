/**
 * Dependency Injection Container
 *
 * This module provides a simple DI container for managing dependencies
 * across the infrastructure and use case layers.
 *
 * Architecture:
 * - Infrastructure services implement domain interfaces
 * - Use cases depend on domain interfaces
 * - Container wires everything together at app startup
 */

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
 * Create and initialize the DI container
 * This function is called once at application startup
 */
export function createContainer(): Container {
  // ============================================================================
  // Infrastructure Layer Initialization
  // ============================================================================

  const authService = new SuperTokensAuthService();
  const userRepository = new InMemoryUserRepository();
  const emailService = new ConsoleEmailService();

  const infra: InfrastructureServices = {
    authService,
    userRepository,
    emailService,
  };

  // ============================================================================
  // Use Case Layer Initialization
  // ============================================================================

  const useCases: UseCases = {
    registerUser: new RegisterUserUseCase(userRepository, emailService),
    updateUserProfile: new UpdateUserProfileUseCase(userRepository),
  };

  // ============================================================================
  // Return Complete Container
  // ============================================================================

  return {
    infra,
    useCases,
  };
}

/**
 * Global container instance
 * Initialized once at app startup
 */
let containerInstance: Container | null = null;

/**
 * Get the global container instance
 * @throws Error if container hasn't been initialized
 */
export function getContainer(): Container {
  if (!containerInstance) {
    throw new Error(
      "Container not initialized. Call initializeContainer() first."
    );
  }
  return containerInstance;
}

/**
 * Initialize the global container
 * Should be called once at application startup
 */
export function initializeContainer(): Container {
  if (containerInstance) {
    console.warn("Container already initialized, returning existing instance");
    return containerInstance;
  }

  containerInstance = createContainer();
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetContainer(): void {
  containerInstance = null;
}
