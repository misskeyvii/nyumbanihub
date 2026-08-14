import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

type LockFn = (
  name: string,
  acquireTimeout: number,
  fn: () => Promise<unknown>,
) => Promise<unknown>;

// Supabase uses a navigator lock internally to prevent cross-tab token
// refreshes from colliding. We cap it so a stuck lock can never freeze the app.
const lockWithTimeout: LockFn = (name, acquireTimeout, fn) => {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    return fn();
  }

  return new Promise<unknown>((resolve, reject) => {
    // Supabase passes -1 (or 0) when it wants the lock to wait indefinitely.
    // setTimeout treats any non-positive value as "fire now", which instantly
    // rejects the lock — so we only arm a timer when there's a real timeout.
    const timer = acquireTimeout > 0
      ? setTimeout(() => {
          reject(new Error(`Lock "${name}" timed out after ${acquireTimeout}ms`));
        }, acquireTimeout)
      : null;

    navigator.locks
      .request(name, { mode: 'exclusive' }, () => fn())
      .then(resolve)
      .catch(reject)
      .finally(() => {
        if (timer !== null) {
          clearTimeout(timer);
        }
      });
  });
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: lockWithTimeout,
  },
});