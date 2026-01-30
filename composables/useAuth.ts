import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);

  async function init(): Promise<void> {
    try {
      const supabase = useSupabase();
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      session.value = s;
      user.value = s?.user ?? null;

      supabase.auth.onAuthStateChange((_event, s) => {
        session.value = s;
        user.value = s?.user ?? null;
      });
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
    try {
      const supabase = useSupabase();
      await supabase.auth.signOut();
      await router.push('/login');
    } catch {
      await router.push('/login');
    }
  }

  const isAuthenticated = computed(() => !!session.value);

  return { user, session, loading, isAuthenticated, init, login, logout };
}
