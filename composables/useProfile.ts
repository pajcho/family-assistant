import type { Profile } from '~/types/database';

export function useProfile() {
  const supabase = useSupabase();
  const { user } = useAuth();

  // Use useState to share profile across components
  const profile = useState<Profile | null>('user-profile', () => null);
  const familyId = computed(() => profile.value?.family_id ?? null);

  async function fetchProfile(): Promise<Profile | null> {
    // Return cached if already fetched
    if (profile.value) return profile.value;

    const uid = user.value?.id;
    if (!uid) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (error) return null;
    profile.value = data as Profile;
    return profile.value;
  }

  function clearProfile(): void {
    profile.value = null;
  }

  return { profile, familyId, fetchProfile, clearProfile };
}
