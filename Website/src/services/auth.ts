import type { StoredAuth } from '../types/emby.types';

const AUTH_KEY = 'emby_auth';

export const authService = {
  saveAuth(auth: StoredAuth): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  },

  getAuth(): StoredAuth | null {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clearAuth(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  isAuthenticated(): boolean {
    return this.getAuth() !== null;
  },
};
