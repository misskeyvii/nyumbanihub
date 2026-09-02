import { supabase, hasSupabaseConfig } from './supabaseClient';
import { setSession, clearSession, type SessionUser } from './session';
import { checkPosEligibility } from './posAccess';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  business_type: string;
  business_id: string | null;
  title: string | null;
  initials: string | null;
}

export interface MainAppUser {
  id: string;
  email: string;
  name: string;
  account_type: string;
  extra_account_types: string[];
  subscription_expires_at: string | null;
  subscription_details: Record<string, unknown> | null;
}

// Default business configurations for different account types
const BUSINESS_CONFIGS: Record<string, {
  businessName: string;
  ownerRole: string;
  posId: string;
  plan: string;
}> = {
  shop: {
    businessName: 'My Shop',
    ownerRole: 'Shop Owner',
    posId: 'SHP',
    plan: 'Shop Plan'
  },
  landlord: {
    businessName: 'Property Management',
    ownerRole: 'Property Manager',
    posId: 'LND',
    plan: 'Landlord Plan'
  },
  marketplace: {
    businessName: 'Marketplace Business',
    ownerRole: 'Business Owner',
    posId: 'MKT',
    plan: 'Marketplace Plan'
  },
  airbnb: {
    businessName: 'Hospitality Business',
    ownerRole: 'Host',
    posId: 'AIR',
    plan: 'Airbnb Plan'
  },
  hotel: {
    businessName: 'Hotel Business',
    ownerRole: 'Hotel Manager',
    posId: 'HTL',
    plan: 'Hotel Plan'
  },
  service: {
    businessName: 'Service Business',
    ownerRole: 'Service Provider',
    posId: 'SRV',
    plan: 'Service Plan'
  },
  entertainment: {
    businessName: 'Entertainment Business',
    ownerRole: 'Entertainment Provider',
    posId: 'ENT',
    plan: 'Entertainment Plan'
  },
  'pos-only': {
    businessName: 'POS Business',
    ownerRole: 'Business Owner',
    posId: 'POS',
    plan: 'POS-Only Plan'
  }
};

function getBusinessConfig(accountType: string) {
  return BUSINESS_CONFIGS[accountType] || BUSINESS_CONFIGS['pos-only'];
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  business_type: string;
  business_id: string | null;
  title: string | null;
  initials: string | null;
}

export interface MainAppUser {
  id: string;
  email: string;
  name: string;
  account_type: string;
  extra_account_types: string[];
  subscription_expires_at: string | null;
  subscription_details: Record<string, unknown> | null;
}

/**
 * Load main app user data to check POS eligibility
 */
export async function loadMainAppUser(userId: string): Promise<MainAppUser | null> {
  if (!hasSupabaseConfig) return null;

  const { data: userData, error } = await supabase
    .from('users')
    .select('id, email, name, account_type, extra_account_types, subscription_expires_at, subscription_details')
    .eq('id', userId)
    .maybeSingle();

  if (error || !userData) return null;

  return {
    ...userData,
    extra_account_types: userData.extra_account_types || [],
    subscription_details: typeof userData.subscription_details === 'string' 
      ? JSON.parse(userData.subscription_details) 
      : userData.subscription_details || {},
  };
}

/**
 * Create session from main app user data
 */
export function createSessionFromMainAppUser(mainAppUser: MainAppUser): SessionUser | null {
  const eligibility = checkPosEligibility(
    mainAppUser.account_type,
    mainAppUser.extra_account_types,
    mainAppUser.subscription_expires_at,
    mainAppUser.subscription_details || {}
  );

  if (!eligibility.canAccess || !eligibility.accountType) {
    return null;
  }

  const config = getBusinessConfig(eligibility.accountType);
  
  return {
    type: eligibility.accountType,
    role: 'admin', // Default to admin for main app users
    name: mainAppUser.name || 'Business Owner',
    email: mainAppUser.email,
    title: config.ownerRole,
    initials: mainAppUser.name 
      ? mainAppUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'BO',
    businessName: config.businessName,
    posId: config.posId,
    planLabel: config.plan,
  };
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  if (!hasSupabaseConfig) {
    throw new Error('POS system requires database connection. Please contact support.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session?.user) {
    throw new Error('Authentication failed.');
  }

  // Load from main app users table to check POS eligibility
  const mainAppUser = await loadMainAppUser(data.session.user.id);
  if (mainAppUser) {
    const sessionUser = createSessionFromMainAppUser(mainAppUser);
    if (sessionUser) {
      setSession(sessionUser);
      return sessionUser;
    } else {
      // Check eligibility to provide specific error
      const eligibility = checkPosEligibility(
        mainAppUser.account_type,
        mainAppUser.extra_account_types,
        mainAppUser.subscription_expires_at,
        mainAppUser.subscription_details || {}
      );
      throw new Error(eligibility.reason || 'Not eligible for POS access. Please subscribe to POS in your profile.');
    }
  }

  throw new Error('Account not found or no POS access. Please ensure you have an active Nyumbani Link account with POS subscription.');
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseConfig) {
    clearSession();
    return;
  }

  await supabase.auth.signOut();
  clearSession();
}

export async function hydrateSession(): Promise<SessionUser | null> {
  if (!hasSupabaseConfig) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;

  // Load from main app users table
  const mainAppUser = await loadMainAppUser(data.session.user.id);
  if (mainAppUser) {
    const sessionUser = createSessionFromMainAppUser(mainAppUser);
    if (sessionUser) {
      setSession(sessionUser);
      return sessionUser;
    } else {
      // User authenticated but no POS access - return null instead of throwing
      // This allows the login page to show an error instead of looping
      clearSession();
      return null;
    }
  }

  // If user exists in auth but not in users table, return null
  clearSession();
  return null;
}

export function homePathForUser(user: SessionUser): string {
  // Default home path for all users (can be customized based on role later)
  return user.role === 'staff' ? '/app/pos' : '/app/dashboard';
}
