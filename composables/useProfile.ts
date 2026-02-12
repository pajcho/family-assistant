import type { Profile, Family } from '~/types/database';

export function useProfile() {
  const supabase = useSupabase();
  const { user } = useAuth();

  // Use useState to share profile across components
  const profile = useState<Profile | null>('user-profile', () => null);
  const family = useState<Family | null>('user-family', () => null);
  const familyId = computed(() => profile.value?.family_id ?? null);
  const familyName = computed(() => family.value?.name ?? null);

  async function fetchProfile(): Promise<Profile | null> {
    const userId = user.value?.id;
    if (!userId) return null;

    // Fetch profile if not cached
    if (!profile.value) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) return null;
      profile.value = data as Profile;
    }

    // Also fetch family data if not already loaded
    if (profile.value?.family_id && !family.value) {
      await fetchFamily(profile.value.family_id);
    }

    return profile.value;
  }

  async function fetchFamily(fid: string): Promise<Family | null> {
    if (family.value?.id === fid) return family.value;

    const { data, error } = await supabase.from('families').select('*').eq('id', fid).single();
    if (error) return null;
    family.value = data as Family;
    return family.value;
  }

  function clearProfile(): void {
    profile.value = null;
    family.value = null;
  }

  return { profile, family, familyId, familyName, fetchProfile, clearProfile };
}
