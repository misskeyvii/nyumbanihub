export interface SessionUser {
  type: string; // account type like 'shop', 'hotel', etc.
  role: 'admin' | 'staff';
  name: string;
  email: string;
  title: string;
  initials: string;
  businessName: string;
  posId: string;
  planLabel: string;
}

const KEY = 'nyumbani-pos-session';
const validTypes: string[] = ['shop', 'hotel', 'airbnb', 'marketplace', 'homes', 'landlord', 'service', 'entertainment', 'pos-only'];

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionUser;
      if (
        parsed &&
        validTypes.includes(parsed.type) &&
        (parsed.role === 'admin' || parsed.role === 'staff')
      ) {
        return parsed;
      }
    }
  } catch {
    // fall through to return null
  }
  return null;
}

export function useSession(): SessionUser | null {
  return getSession();
}

export function setSession(user: SessionUser): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(user));
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(KEY);
  }
}

// Helper functions for backwards compatibility
export function getDemoType(): string {
  return getSession()?.type || 'shop';
}

export function isAdmin(): boolean {
  return getSession()?.role === 'admin';
}

export function currentUserName(): string {
  return getSession()?.name || 'User';
}