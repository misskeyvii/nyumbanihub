import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ?? '';
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

type LockFn = <R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>,
) => Promise<R>;

// Supabase uses a navigator lock internally to prevent cross-tab token
// refreshes from colliding. We cap it so a stuck lock can never freeze the app.
const lockWithTimeout: LockFn = <R>(name: string, acquireTimeout: number, fn: () => Promise<R>) => {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    return fn();
  }

  return new Promise<R>((resolve, reject) => {
    const timer = acquireTimeout > 0
      ? setTimeout(() => {
          reject(new Error(`Lock "${name}" timed out after ${acquireTimeout}ms`));
        }, acquireTimeout)
      : null;

    navigator.locks
      .request(name, { mode: 'exclusive' }, async () => {
        const result = await fn();
        resolve(result);
        return result;
      })
      .catch(reject)
      .finally(() => {
        if (timer !== null) {
          clearTimeout(timer);
        }
      });
  });
};

const mockSupabase = {
  auth: {
    getSession: async () => {
      if (typeof window === 'undefined') {
        return { data: { session: null }, error: null };
      }

      const raw = window.localStorage.getItem('nyumbani-pos-session');
      if (!raw) {
        return { data: { session: null }, error: null };
      }

      return {
        data: {
          session: {
            user: {
              id: 'demo-user',
              email: JSON.parse(raw).email ?? '',
            },
          },
        },
        error: null,
      };
    },
    onAuthStateChange: (_callback: (event: string, session: unknown) => void) => ({
      data: { subscription: { unsubscribe: () => undefined } },
      error: null,
    }),
    signInWithPassword: async () => ({ data: { user: { id: 'demo-user', email: '' } }, error: null }),
    signOut: async () => ({ error: null }),
  },
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null }),
      }),
    }),
  }),
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: lockWithTimeout,
      },
    })
  : mockSupabase;