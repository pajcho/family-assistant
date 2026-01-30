import type { Expense } from '~/types/database';

export function useExpenses() {
  const supabase = useSupabase();
  const { familyId } = useProfile();

  async function fetchExpenses(hidePaid = false): Promise<Expense[]> {
    const fid = familyId.value;
    if (!fid) return [];
    let q = supabase
      .from('expenses')
      .select('*')
      .eq('family_id', fid)
      .order('amount', { ascending: false });
    if (hidePaid) q = q.eq('is_paid', false);
    const { data, error } = await q;
    if (error) return [];
    return (data as Expense[]) ?? [];
  }

  async function createExpense(payload: {
    name: string;
    description?: string;
    amount: number;
  }): Promise<{ data: Expense | null; error: Error | null }> {
    const fid = familyId.value;
    if (!fid) return { data: null, error: new Error('Nema porodice') };
    const { data, error } = await supabase
      .from('expenses')
      .insert({ family_id: fid, ...payload, is_paid: false, paid_date: null })
      .select()
      .single();
    return { data: data as Expense | null, error: error as Error | null };
  }

  async function updateExpense(
    id: string,
    payload: Partial<Pick<Expense, 'name' | 'description' | 'amount'>>,
  ): Promise<{ data: Expense | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Expense | null, error: error as Error | null };
  }

  async function deleteExpense(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    return { error: error as Error | null };
  }

  async function markAsPaid(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('expenses')
      .update({ is_paid: true, paid_date: new Date().toISOString() })
      .eq('id', id);
    return { error: error as Error | null };
  }

  return { fetchExpenses, createExpense, updateExpense, deleteExpense, markAsPaid };
}
