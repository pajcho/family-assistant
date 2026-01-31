import type { Payment, PaymentHistory, RecurrencePeriod } from '~/types/database';
import { addMonth, subtractMonth } from '~/utils/format';

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

  async function fetchPaymentHistory(monthFilter?: string): Promise<PaymentHistory[]> {
    const fid = familyId.value;
    if (!fid) return [];
    let q = supabase
      .from('payment_history')
      .select('*')
      .eq('family_id', fid)
      .order('due_date', { ascending: true });
    if (monthFilter) {
      // Filter by month: monthFilter is "YYYY-MM" format
      const startDate = `${monthFilter}-01`;
      const [year, month] = monthFilter.split('-').map(Number);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      q = q.gte('due_date', startDate).lt('due_date', endDate);
    }
    const { data, error } = await q;
    if (error) return [];
    return (data as PaymentHistory[]) ?? [];
  }

  async function hasPaymentHistory(paymentId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('payment_history')
      .select('id', { count: 'exact', head: true })
      .eq('payment_id', paymentId);
    if (error) return false;
    return (count ?? 0) > 0;
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
        | 'is_paused'
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

    // Insert into payment_history before updating
    const { error: historyErr } = await supabase.from('payment_history').insert({
      payment_id: id,
      family_id: row.family_id,
      amount: row.amount,
      due_date: row.due_date,
      paid_date: now,
    });
    if (historyErr) return { error: historyErr as Error };

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

  async function togglePause(id: string): Promise<{ error: Error | null }> {
    const { data: row, error: fetchErr } = await supabase
      .from('payments')
      .select('is_paused, due_date')
      .eq('id', id)
      .single();
    if (fetchErr || !row) return { error: (fetchErr as Error) ?? new Error('Nije pronađeno') };

    const willUnpause = row.is_paused === true;
    const updates: { is_paused: boolean; due_date?: string } = { is_paused: !row.is_paused };

    // When unpausing, check if due_date is in the past
    if (willUnpause && row.due_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(row.due_date + 'T00:00:00');

      if (dueDate < today) {
        // Move to the same day in current month
        const day = dueDate.getDate();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Handle edge case: if day doesn't exist in current month (e.g., 31st in February)
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const newDay = Math.min(day, lastDayOfMonth);

        const newDueDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
        updates.due_date = newDueDate;
      }
    }

    const { error } = await supabase.from('payments').update(updates).eq('id', id);
    return { error: error as Error | null };
  }

  async function getLastHistoryEntry(paymentId: string): Promise<PaymentHistory | null> {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('payment_id', paymentId)
      .order('paid_date', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return null;
    return data as PaymentHistory;
  }

  async function undoLastPayment(paymentId: string): Promise<{ error: Error | null }> {
    // 1. Get payment details
    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    if (paymentErr || !payment) {
      return { error: (paymentErr as Error) ?? new Error('Plaćanje nije pronađeno') };
    }

    // 2. Get the last history entry
    const lastHistory = await getLastHistoryEntry(paymentId);
    if (!lastHistory) {
      return { error: new Error('Nema istorije za poništavanje') };
    }

    // 3. Delete the history entry
    const { error: deleteErr } = await supabase
      .from('payment_history')
      .delete()
      .eq('id', lastHistory.id);
    if (deleteErr) return { error: deleteErr as Error };

    // 4. Revert payment state based on type
    const period = payment.recurrence_period as RecurrencePeriod | null;
    const isRecurring = payment.is_recurring === true;

    // Check if due_date was already reverted (history due_date matches current payment due_date)
    // This can happen if previous undo attempt failed to delete history but succeeded in reverting
    const alreadyReverted = lastHistory.due_date === payment.due_date;

    if (!isRecurring || period === 'one-time') {
      // One-time: just mark as unpaid (only if not already reverted)
      if (!alreadyReverted) {
        const { error } = await supabase
          .from('payments')
          .update({ is_paid: false, paid_date: null })
          .eq('id', paymentId);
        return { error: error as Error | null };
      }
      return { error: null };
    }

    if (period === 'monthly') {
      // Monthly: move due_date back one month (only if not already reverted)
      if (!alreadyReverted) {
        const { error } = await supabase
          .from('payments')
          .update({
            due_date: subtractMonth(payment.due_date),
          })
          .eq('id', paymentId);
        return { error: error as Error | null };
      }
      return { error: null };
    }

    if (period === 'limited') {
      // Limited: move due_date back + increment remaining_occurrences (only if not already reverted)
      if (!alreadyReverted) {
        const updates: {
          due_date?: string;
          remaining_occurrences?: number;
          is_paid?: boolean;
          paid_date?: null;
        } = {};

        // If payment was marked as fully paid (is_paid=true), revert that
        if (payment.is_paid) {
          updates.is_paid = false;
          updates.paid_date = null;
        }

        // Move due_date back
        updates.due_date = subtractMonth(payment.due_date);

        // Increment remaining occurrences
        updates.remaining_occurrences = (payment.remaining_occurrences ?? 0) + 1;

        const { error } = await supabase.from('payments').update(updates).eq('id', paymentId);
        return { error: error as Error | null };
      }
      return { error: null };
    }

    return { error: null };
  }

  return {
    fetchPayments,
    fetchPaymentHistory,
    hasPaymentHistory,
    getLastHistoryEntry,
    undoLastPayment,
    createPayment,
    updatePayment,
    deletePayment,
    markAsPaid,
    togglePause,
  };
}
