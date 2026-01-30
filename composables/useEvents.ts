import type { Event } from '~/types/database';

export function useEvents() {
  const supabase = useSupabase();
  const { familyId } = useProfile();

  async function fetchEvents(from?: string, to?: string): Promise<Event[]> {
    const fid = familyId.value;
    if (!fid) return [];
    let q = supabase
      .from('events')
      .select('*')
      .eq('family_id', fid)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    if (from) q = q.gte('date', from);
    if (to) q = q.lte('date', to);
    const { data, error } = await q;
    if (error) return [];
    return (data as Event[]) ?? [];
  }

  async function createEvent(payload: {
    name: string;
    description?: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }): Promise<{ data: Event | null; error: Error | null }> {
    const fid = familyId.value;
    if (!fid) return { data: null, error: new Error('Nema porodice') };
    const { data, error } = await supabase
      .from('events')
      .insert({ family_id: fid, ...payload })
      .select()
      .single();
    return { data: data as Event | null, error: error as Error | null };
  }

  async function updateEvent(
    id: string,
    payload: Partial<
      Pick<Event, 'name' | 'description' | 'date' | 'start_time' | 'end_time' | 'notes'>
    >,
  ): Promise<{ data: Event | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Event | null, error: error as Error | null };
  }

  async function deleteEvent(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    return { error: error as Error | null };
  }

  return { fetchEvents, createEvent, updateEvent, deleteEvent };
}
