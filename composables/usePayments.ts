import type { Payment, RecurrencePeriod } from '~/types/database';
import { addMonth } from '~/utils/format';

export function usePayments() {
  const supabase = useSupabase();
  const { familyId } = useProfile();

  async function fetchPayments(hidePaid = false): Promise<Payment[]> {
    const fid = familyId.value;
    if (!fid) return [];
    let q = supabase
      .from('payments')
      .select('*')
      .eq('family_id', fid)
      .order('due_date', { ascending: true });
    if (hidePaid) q = q.eq('is_paid', false);
    const { data, error } = await q;
    if (error) return [];
    return (data as Payment[]) ?? [];
  }

  async function createPayment(payload: {
    name: string;
    description?: string;
    amount: number;
    due_date: string;
    is_recurring: boolean;
    recurrence_period: RecurrencePeriod | null;
    remaining_occurrences?: number | null;
  }): Promise<{ data: Payment | null; error: Error | null }> {
    const fid = familyId.value;
    if (!fid) return { data: null, error: new Error('Nema porodice') };
    const { data, error } = await supabase
      .from('payments')
      .insert({
        family_id: fid,
        ...payload,
        is_paid: false,
        paid_date: null,
      })
      .select()
      .single();
    return { data: data as Payment | null, error: error as Error | null };
  }

  async function updatePayment(
    id: string,
    payload: Partial<
      Pick<
        Payment,
        | 'name'
        | 'description'
        | 'amount'
        | 'due_date'
        | 'is_recurring'
        | 'recurrence_period'
        | 'remaining_occurrences'
      >
    >,
  ): Promise<{ data: Payment | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('payments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Payment | null, error: error as Error | null };
  }

  async function deletePayment(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    return { error: error as Error | null };
  }

  async function markAsPaid(id: string): Promise<{ error: Error | null }> {
    const { data: row, error: fetchErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr || !row) return { error: (fetchErr as Error) ?? new Error('Nije pronađeno') };

    const now = new Date().toISOString();
    const period = row.recurrence_period as RecurrencePeriod | null;
    const isRecurring = row.is_recurring === true;

    if (!isRecurring || period === 'one-time') {
      const { error } = await supabase
        .from('payments')
        .update({ is_paid: true, paid_date: now })
        .eq('id', id);
      return { error: error as Error | null };
    }

    if (period === 'monthly') {
      const { error } = await supabase
        .from('payments')
        .update({
          is_paid: false,
          paid_date: null,
          due_date: addMonth(row.due_date),
        })
        .eq('id', id);
      return { error: error as Error | null };
    }

    if (period === 'limited') {
      const remaining = (row.remaining_occurrences ?? 1) - 1;
      if (remaining <= 0) {
        const { error } = await supabase
          .from('payments')
          .update({ is_paid: true, paid_date: now, remaining_occurrences: 0 })
          .eq('id', id);
        return { error: error as Error | null };
      }
      const { error } = await supabase
        .from('payments')
        .update({
          is_paid: false,
          paid_date: null,
          due_date: addMonth(row.due_date),
          remaining_occurrences: remaining,
        })
        .eq('id', id);
      return { error: error as Error | null };
    }

    const { error } = await supabase
      .from('payments')
      .update({ is_paid: true, paid_date: now })
      .eq('id', id);
    return { error: error as Error | null };
  }

  return { fetchPayments, createPayment, updatePayment, deletePayment, markAsPaid };
}
