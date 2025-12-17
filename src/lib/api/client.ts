/**
 * HTTP Client configuration
 * Following CLAUDE.md patterns: contract-first design, proper error handling
 */

import { AUTH_ERRORS } from '@/lib/constants/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Generic API call function with credentials included
 * CRITICAL: credentials: 'include' is required for cookies
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params if provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include', // 🔑 CRITICAL: Required for cookies
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      // Trigger logout event - will be handled by AuthContext
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new ApiError(AUTH_ERRORS.UNAUTHORIZED, 401);
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError(AUTH_ERRORS.FORBIDDEN, 403);
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `HTTP Error ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    // Network errors
    if (error instanceof TypeError) {
      throw new ApiError(AUTH_ERRORS.NETWORK_ERROR, 0);
    }

    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown errors
    throw new ApiError(AUTH_ERRORS.UNKNOWN_ERROR, 500, error);
  }
}

/**
 * HTTP methods helpers
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
};
