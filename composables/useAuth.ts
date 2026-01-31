import type { User, Session } from '@supabase/supabase-js';

// Track if auth listener is already set up (module-level, survives HMR)
let listenerAttached = false;

export function useAuth() {
  const router = useRouter();

  // Use useState to share state across all components
  const user = useState<User | null>('auth-user', () => null);
  const session = useState<Session | null>('auth-session', () => null);
  const loading = useState<boolean>('auth-loading', () => true);
  const initialized = useState<boolean>('auth-initialized', () => false);

  async function init(): Promise<void> {
    // Skip if already initialized
    if (initialized.value) return;

    try {
      const supabase = useSupabase();
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      session.value = s;
      user.value = s?.user ?? null;

      // Only attach listener once
      if (!listenerAttached) {
        listenerAttached = true;
        supabase.auth.onAuthStateChange((_event, s) => {
          session.value = s;
          user.value = s?.user ?? null;
        });
      }

      initialized.value = true;
    } catch {
      session.value = null;
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      const supabase = useSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) await router.push('/');
      return { error };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Greška pri prijavi') };
    }
  }

  async function logout(): Promise<void> {
    // Get profile state to clear it
    const profile = useState<unknown>('user-profile');

    try {
      const supabase = useSupabase();
      await supabase.auth.signOut();
    } catch {
      // Continue with cleanup even if sign out fails
    }

    // Clear all state
    session.value = null;
    user.value = null;
    initialized.value = false;
    profile.value = null;
    await router.push('/login');
  }

  const isAuthenticated = computed(() => !!session.value);

  return { user, session, loading, isAuthenticated, init, login, logout };
}
