import type { Profile } from '~/types/database';

export function useProfile() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const profile = ref<Profile | null>(null);
  const familyId = computed(() => profile.value?.family_id ?? null);

  async function fetchProfile(): Promise<Profile | null> {
    const uid = user.value?.id;
    if (!uid) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (error) return null;
    profile.value = data as Profile;
    return profile.value;
  }

  return { profile, familyId, fetchProfile };
}
