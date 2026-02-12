import type { Birthday } from '~/types/database';

export function useBirthdays() {
  const supabase = useSupabase();
  const { familyId } = useProfile();

  async function fetchBirthdays(): Promise<Birthday[]> {
    const familyIdValue = familyId.value;
    if (!familyIdValue) return [];
    const { data, error } = await supabase
      .from('birthdays')
      .select('*')
      .eq('family_id', familyIdValue)
      .order('birth_date', { ascending: true });
    if (error) return [];
    return (data as Birthday[]) ?? [];
  }

  async function createBirthday(payload: {
    name: string;
    description?: string;
    birth_date: string;
  }): Promise<{ data: Birthday | null; error: Error | null }> {
    const familyIdValue = familyId.value;
    if (!familyIdValue) return { data: null, error: new Error('Nema porodice') };
    const { data, error } = await supabase
      .from('birthdays')
      .insert({ family_id: familyIdValue, ...payload })
      .select()
      .single();
    return { data: data as Birthday | null, error: error as Error | null };
  }

  async function updateBirthday(
    id: string,
    payload: Partial<Pick<Birthday, 'name' | 'description' | 'birth_date'>>,
  ): Promise<{ data: Birthday | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('birthdays')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Birthday | null, error: error as Error | null };
  }

  async function deleteBirthday(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('birthdays').delete().eq('id', id);
    return { error: error as Error | null };
  }

  return { fetchBirthdays, createBirthday, updateBirthday, deleteBirthday };
}
