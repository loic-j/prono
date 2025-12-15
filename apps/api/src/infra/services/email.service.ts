/**
 * Console Email Service Implementation
 *
 * This is a simple implementation that logs emails to the console
 * In production, replace this with a real email service (e.g., SendGrid, AWS SES, Resend)
 */

import { singleton } from "tsyringe";
import { IEmailService } from "../../domain";
import { logger } from "../../utils/logger";

@singleton()
export class ConsoleEmailService implements IEmailService {
  async sendVerificationEmail(
    email: string,
    verificationToken: string
  ): Promise<void> {
    logger.info(
      {
        to: email,
        type: "verification",
        token: verificationToken,
      },
      "Email sent: Verification"
    );

    // In production, send actual email:
    // await this.emailClient.send({
    //   to: email,
    //   subject: "Verify your email",
    //   html: `Click here to verify: ${process.env.APP_URL}/verify?token=${verificationToken}`,
    // });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    logger.info(
      {
        to: email,
        type: "password-reset",
        token: resetToken,
      },
      "Email sent: Password Reset"
    );

    // In production, send actual email:
    // await this.emailClient.send({
    //   to: email,
    //   subject: "Reset your password",
    //   html: `Click here to reset: ${process.env.APP_URL}/reset-password?token=${resetToken}`,
    // });
  }

  async sendWelcomeEmail(email: string, displayName?: string): Promise<void> {
    logger.info(
      {
        to: email,
        type: "welcome",
        displayName,
      },
      "Email sent: Welcome"
    );

    // In production, send actual email:
    // await this.emailClient.send({
    //   to: email,
    //   subject: "Welcome to Prono!",
    //   html: `Welcome ${displayName || email}! Thanks for joining.`,
    // });
  }
}
