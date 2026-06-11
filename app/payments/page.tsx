'use client';
import { useEffect, useState } from 'react';
import { getPlayers, getPayments, addPayment, deletePayment } from '@/lib/db';
import { Player, Payment } from '@/lib/types';

function fmt(date: Date) {
  return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PaymentsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ playerId: '', amount: '', date: '', notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [pl, pay] = await Promise.all([getPlayers(), getPayments()]);
    setPlayers(pl);
    setPayments(pay);
    if (pl.length > 0 && !form.playerId) {
      setForm((f) => ({ ...f, playerId: pl[0].id, date: new Date().toISOString().split('T')[0] }));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
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
    const pay = await getPayments();
    setPayments(pay);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this payment record?')) return;
    await deletePayment(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  const playerMap = Object.fromEntries(players.map((p) => [p.id, p.name]));

  // Per-player totals
  const totals: Record<string, number> = {};
  payments.forEach((p) => { totals[p.playerId] = (totals[p.playerId] || 0) + p.amount; });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Log Payment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Player</label>
            <select
              required
              value={form.playerId}
              onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {players.length === 0 && <option value="">No players yet</option>}
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (RM)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. GCash transfer"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || players.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Log Payment'}
        </button>
      </form>

      {!loading && Object.keys(totals).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Total Paid per Player</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(totals).map(([pid, total]) => (
              <div key={pid} className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-sm">
                <span className="font-medium text-green-800">{playerMap[pid] || 'Unknown'}</span>
                <span className="text-green-600 ml-2">RM {total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">No payments logged yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">History</span>
          </div>
          {payments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3.5 ${
                i < payments.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div>
                <span className="text-sm font-medium text-gray-900">{playerMap[p.playerId] || 'Unknown'}</span>
                <span className="text-xs text-gray-500 ml-2">{fmt(p.date)}</span>
                {p.notes && <span className="text-xs text-gray-400 ml-2">· {p.notes}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-green-600">RM {p.amount.toFixed(0)}</span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
