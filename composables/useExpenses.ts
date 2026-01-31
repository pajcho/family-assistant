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
      .order('sort_order', { ascending: true });
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

    // Get max sort_order to add new expense at the end
    const { data: maxData } = await supabase
      .from('expenses')
      .select('sort_order')
      .eq('family_id', fid)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();
    const nextOrder = (maxData?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        family_id: fid,
        ...payload,
        is_paid: false,
        paid_date: null,
        sort_order: nextOrder,
      })
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

  async function reorderExpenses(
    expenseUpdates: { id: string; sort_order: number }[],
  ): Promise<{ error: Error | null }> {
    // Update all expenses with new sort_order values in parallel
    const results = await Promise.all(
      expenseUpdates.map((expense) =>
        supabase.from('expenses').update({ sort_order: expense.sort_order }).eq('id', expense.id),
      ),
    );
    const failedResult = results.find((r) => r.error);
    if (failedResult?.error) return { error: failedResult.error as Error };
    return { error: null };
  }

  return {
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,
    reorderExpenses,
  };
}
