import { SessionData } from '@shared/types';

const SESSION_KEY = 'watch_party_session';

export const sessionManager = {
  get(): SessionData | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to parse session data', e);
      return null;
    }
  },

  set(session: SessionData): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session data', e);
    }
  },

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
  }
};
