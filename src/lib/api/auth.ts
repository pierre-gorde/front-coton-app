/**
 * Authentication API endpoints
 * Following CLAUDE.md patterns: contract-first design, type safety
 */

import { api } from './client';
import { AUTH_ENDPOINTS } from '@/lib/constants/auth';
import type { User } from '@/lib/types';

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyRequest {
  token: string;
}

/**
 * Request a magic link to be sent to the user's email
 * @param email - User's email address
 * @param redirectUrl - Optional URL to redirect after verification
 */
export async function requestMagicLink(
  email: string,
  redirectUrl?: string
): Promise<LoginResponse> {
  const params = redirectUrl ? { redirect: redirectUrl } : undefined;

  return api.post<LoginResponse>(
    AUTH_ENDPOINTS.LOGIN,
    { email },
    { params }
  );
}

/**
 * Verify magic link token and authenticate user
 * Sets auth_token cookie on success
 * @param token - Magic link token from URL
 */
export async function verifyMagicLink(token: string): Promise<User> {
  return api.post<User>(AUTH_ENDPOINTS.VERIFY, { token });
}

/**
 * Get current authenticated user
 * Requires valid auth_token cookie
 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>(AUTH_ENDPOINTS.ME);
}

/**
 * Logout current user
 * Clears auth_token cookie
 */
export async function logout(): Promise<void> {
  return api.post<void>(AUTH_ENDPOINTS.LOGOUT);
}
