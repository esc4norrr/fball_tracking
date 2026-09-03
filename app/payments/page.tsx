'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPlayers, getSessions, getPayments, addPayment, deletePayment } from '@/lib/db';
import { Player, Payment, Session } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { formatAmount, formatRM } from '@/lib/format';
import { CheckCircle, Funnel, Plus, Receipt, Trash, Wallet } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

function fmt(date: Date) {
  return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PaymentsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ playerId: '', amount: '', date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const confirm = useConfirm();
  const toast = useToast();

  async function load() {
    const [pl, sess, pay] = await Promise.all([getPlayers(), getSessions(), getPayments()]);
    setPlayers(pl);
    setSessions(sess);
    setPayments(pay);
    if (pl.length > 0 && !form.playerId) {
      setForm((f) => ({ ...f, playerId: pl[0].id, date: new Date().toISOString().split('T')[0] }));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => computeStats(players, sessions, payments), [players, sessions, payments]);
  const statsMap = useMemo(() => Object.fromEntries(stats.map((s) => [s.player.id, s])), [stats]);
  const selectedStat = statsMap[form.playerId];

  const outstanding = useMemo(
    () => stats.filter((s) => s.balance < -0.005).sort((a, b) => a.balance - b.balance),
    [stats]
  );

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.playerId || !form.amount || !form.date) return;
    setSaving(true);
    await addPayment({
      playerId: form.playerId,
      amount: parseFloat(form.amount),
      date: new Date(form.date),
      notes: form.notes,
    });
    setForm((f) => ({ ...f, amount: '', notes: '' }));
    setSaving(false);
    toast.success('Payment logged');
    const pay = await getPayments();
    setPayments(pay);
  }

  function fillOwed(playerId: string) {
    const stat = statsMap[playerId];
    if (!stat || stat.balance >= 0) return;
    setForm((f) => ({ ...f, playerId, amount: (-stat.balance).toFixed(2).replace(/\.00$/, '') }));
  }

  async function handleDelete(id: string, playerName: string, amount: number) {
    const ok = await confirm({
      title: 'Delete this payment?',
      description: `${playerName}'s ${formatRM(amount)} record will be removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await deletePayment(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    toast.success('Payment deleted');
  }

  const playerMap = Object.fromEntries(players.map((p) => [p.id, p.name]));
  const visiblePayments = historyFilter === 'all' ? payments : payments.filter((p) => p.playerId === historyFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold text-text">Payments</h1>

      <Card className="p-5">
        <h2 className="font-medium text-text text-sm mb-4">Log Payment</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Player" htmlFor="player">
              <Select
                id="player"
                required
                value={form.playerId}
                onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              >
                {players.length === 0 && <option value="">No players yet</option>}
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
              {selectedStat && (
                <p className={`text-xs mt-1.5 ${selectedStat.balance < -0.005 ? 'text-danger' : 'text-text-faint'}`}>
                  {selectedStat.balance < -0.005
                    ? `Owes ${formatRM(-selectedStat.balance)}`
                    : selectedStat.balance > 0.005
                    ? `${formatRM(selectedStat.balance)} in credit`
                    : 'Settled up'}
                </p>
              )}
            </Field>
            <Field label="Amount (RM)" htmlFor="amount">
              <Input
                id="amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 50"
              />
              {selectedStat && selectedStat.balance < -0.005 && (
                <button
                  type="button"
                  onClick={() => fillOwed(form.playerId)}
                  className="text-xs text-accent-text hover:underline mt-1.5"
                >
                  Fill owed amount ({formatRM(-selectedStat.balance)})
                </button>
              )}
            </Field>
            <Field label="Date" htmlFor="date">
              <Input
                id="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Notes (optional)" htmlFor="notes">
              <Input
                id="notes"
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Bank transfer"
              />
            </Field>
          </div>
          <Button type="submit" variant="primary" disabled={saving || players.length === 0}>
            <Plus size={16} weight="bold" />
            {saving ? 'Saving…' : 'Log Payment'}
          </Button>
        </form>
      </Card>

      {!loading && (
        <Card className="p-5">
          <h2 className="font-medium text-text text-sm mb-3 flex items-center gap-1.5">
            <Wallet size={15} className="text-text-faint" />
            Outstanding Balances
          </h2>
          {outstanding.length === 0 ? (
            <p className="text-xs text-text-faint flex items-center gap-1.5">
              <CheckCircle size={14} className="text-accent-text" />
              Everyone&apos;s settled up.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {outstanding.map((s) => (
                <button
                  key={s.player.id}
                  onClick={() => fillOwed(s.player.id)}
                  title={`Fill payment form for ${s.player.name}`}
                  className="flex items-center gap-2 bg-danger-strong/10 border border-danger-strong/25 hover:border-danger-strong/50 rounded-xl px-3 py-1.5 text-sm transition-colors"
                >
                  <span className="font-medium text-text">{s.player.name}</span>
                  <span className="text-danger tabular-nums">{formatAmount(-s.balance)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface-3/50 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-text-faint uppercase tracking-wide">History</span>
          {!loading && players.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Funnel size={13} className="text-text-faint" />
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-transparent text-xs text-text-muted focus:outline-none cursor-pointer"
              >
                <option value="all">All players</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-0">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3.5 w-14" />
              </div>
            ))}
          </div>
        ) : visiblePayments.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={historyFilter === 'all' ? 'No payments logged yet' : `No payments from ${playerMap[historyFilter] ?? 'this player'}`}
          />
        ) : (
          visiblePayments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-0 hover:bg-surface-3/40 transition-colors"
            >
              <div className="min-w-0">
                <span className="text-sm font-medium text-text">{playerMap[p.playerId] || 'Unknown'}</span>
                <span className="text-xs text-text-faint ml-2">{fmt(p.date)}</span>
                {p.notes && <span className="text-xs text-text-faint ml-2">· {p.notes}</span>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-accent-text tabular-nums">{formatRM(p.amount)}</span>
                <button
                  onClick={() => handleDelete(p.id, playerMap[p.playerId] || 'Unknown', p.amount)}
                  aria-label="Delete payment"
                  className="p-1.5 rounded-lg text-text-faint hover:text-danger hover:bg-danger-strong/10 transition-colors"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
