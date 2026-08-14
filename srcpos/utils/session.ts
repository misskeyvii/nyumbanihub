import {
  getDemoAccount,
  getStaffAccount,
  type DemoType,
  type Role,
} from '@/mocks/demoAccounts';

export interface SessionUser {
  type: DemoType;
  role: Role;
  name: string;
  email: string;
  title: string;
  initials: string;
}

const KEY = 'nyumbani-pos-session';
const validTypes: DemoType[] = ['shop', 'hotel', 'airbnb', 'marketplace', 'homes'];

function adminSession(type: DemoType): SessionUser {
  const account = getDemoAccount(type);
  return {
    type,
    role: 'admin',
    name: account.ownerName,
    email: account.ownerEmail,
    title: account.ownerRole,
    initials: account.ownerInitials,
  };
}

function staffSession(type: DemoType): SessionUser {
  const account = getStaffAccount(type);
  return {
    type,
    role: 'staff',
    name: account.name,
    email: account.email,
    title: account.title,
    initials: account.initials,
  };
}

export function getSession(): SessionUser {
  if (typeof window === 'undefined') return adminSession('shop');
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
    // fall through to the default session
  }
  return adminSession('shop');
}

export function setSession(user: SessionUser): void {
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession(): void {
  window.localStorage.removeItem(KEY);
}

export function signInAsAdmin(type: DemoType): void {
  setSession(adminSession(type));
}

export function signInAsStaff(type: DemoType): void {
  setSession(staffSession(type));
}

export function getDemoType(): DemoType {
  return getSession().type;
}

export function setDemoType(type: DemoType): void {
  signInAsAdmin(type);
}

export function isAdmin(): boolean {
  return getSession().role === 'admin';
}

export function currentUserName(): string {
  return getSession().name;
}