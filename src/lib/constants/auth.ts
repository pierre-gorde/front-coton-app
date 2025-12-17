/**
 * Authentication constants
 * Following CLAUDE.md pattern: always use constants for fixed values
 */

export const AUTH_ERRORS = {
  UNAUTHORIZED: 'Session expirée, veuillez vous reconnecter',
  INVALID_TOKEN: 'Magic link invalide ou expiré',
  FORBIDDEN: 'Accès refusé',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue',
} as const;

export const AUTH_SUCCESS = {
  LOGIN_REQUEST: 'Email envoyé ! Vérifiez votre boîte mail',
  LOGIN_VERIFIED: 'Connexion réussie',
  LOGOUT: 'Déconnexion réussie',
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  VERIFY: '/auth/verify',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
} as const;
