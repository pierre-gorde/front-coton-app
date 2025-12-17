/**
 * Authentication Service Layer
 * Following CLAUDE.md pattern: business logic in service layer
 */

import * as authApi from '@/lib/api/auth';
import type { User } from '@/lib/types';

export const authService = {
  /**
   * Request magic link to be sent to user's email
   */
  async requestMagicLink(email: string, redirectUrl?: string) {
    return authApi.requestMagicLink(email, redirectUrl);
  },

  /**
   * Verify magic link and login user
   * Business logic: validate token, authenticate, store session
   */
  async verifyAndLogin(token: string): Promise<User> {
    const user = await authApi.verifyMagicLink(token);

    // Additional business logic could be added here:
    // - Analytics tracking
    // - User preferences loading
    // - Feature flags initialization

    return user;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return authApi.getCurrentUser();
  },

  /**
   * Logout user
   * Business logic: clear session, cleanup state
   */
  async logout(): Promise<void> {
    await authApi.logout();

    // Additional cleanup could be added here:
    // - Clear local storage
    // - Reset analytics
    // - Clear cached data
  },
};
