import { supabase } from './supabaseClient';
import {
  demoAccounts,
  staffAccounts,
  getDemoAccount,
  getStaffAccount,
  homePathFor,
  type DemoType,
  type Role,
} from '@/mocks/demoAccounts';
import { setSession, clearSession, type SessionUser } from './session';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  business_type: DemoType;
  business_id: string | null;
  title: string | null;
  initials: string | null;
}

export function profileToSession(profile: Profile): SessionUser {
  const account = getDemoAccount(profile.business_type);
  const staff = getStaffAccount(profile.business_type);
  const isStaff = profile.role === 'staff';
  return {
    type: profile.business_type,
    role: profile.role,
    name: profile.name || (isStaff ? staff.name : account.ownerName),
    email: profile.email,
    title: profile.title || (isStaff ? staff.title : account.ownerRole),
    initials: profile.initials || (isStaff ? staff.initials : account.ownerInitials),
  };
}

export function deriveSessionFromEmail(email: string): SessionUser | null {
  const normalized = email.trim().toLowerCase();
  const admin = demoAccounts.find(
    (account) =>
      account.email.toLowerCase() === normalized || account.ownerEmail.toLowerCase() === normalized,
  );
  if (admin) {
    return {
      type: admin.type,
      role: 'admin',
      name: admin.ownerName,
      email: admin.ownerEmail,
      title: admin.ownerRole,
      initials: admin.ownerInitials,
    };
  }
  const staff = staffAccounts.find((account) => account.email.toLowerCase() === normalized);
  if (staff) {
    return {
      type: staff.type,
      role: 'staff',
      name: staff.name,
      email: staff.email,
      title: staff.title,
      initials: staff.initials,
    };
  }
  return null;
}

let seedPromise: Promise<void> | null = null;

export function seedDemoUsers(): Promise<void> {
  if (!seedPromise) {
    seedPromise = supabase.functions
      .invoke('seed-demo-users', {})
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message || 'Failed to prepare demo accounts');
        }
      })
      .catch((err) => {
        seedPromise = null;
        throw err;
      });
  }
  return seedPromise;
}

export async function loadProfile(): Promise<Profile | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (error || !profile) return null;
  return profile as Profile;
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  await seedDemoUsers();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const profile = await loadProfile();
  if (profile) {
    const sessionUser = profileToSession(profile);
    setSession(sessionUser);
    return sessionUser;
  }

  const fallback = deriveSessionFromEmail(data.user?.email ?? email);
  if (fallback) {
    setSession(fallback);
    return fallback;
  }

  throw new Error('Account found but no profile is attached. Please contact support.');
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  clearSession();
}

export async function hydrateSession(): Promise<SessionUser | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;

  const profile = await loadProfile();
  if (profile) {
    const sessionUser = profileToSession(profile);
    setSession(sessionUser);
    return sessionUser;
  }

  const fallback = deriveSessionFromEmail(data.session.user.email ?? '');
  if (fallback) {
    setSession(fallback);
    return fallback;
  }

  return null;
}

export function homePathForUser(user: SessionUser): string {
  return user.role === 'staff' ? '/app/pos' : homePathFor(user.type);
}