'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessions, addSession, deleteSession } from '@/lib/db';
import { Session } from '@/lib/types';

function fmt(date: Date) {
  return date.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', costPerPerson: '', notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await getSessions();
    setSessions(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.costPerPerson) return;
    setSaving(true);
    await addSession({
      date: new Date(form.date),
      costPerPerson: parseFloat(form.costPerPerson),
      notes: form.notes,
      attendeeIds: [],
    });
    setForm({ date: '', costPerPerson: '', notes: '' });
    setShowForm(false);
    setSaving(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this session? Attendance data will be lost.')) return;
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Session
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">New Session</h2>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Cost per person (RM)</label>
              <input
                type="number"
                required
                min="0"
                step="0.50"
                value={form.costPerPerson}
                onChange={(e) => setForm({ ...form, costPerPerson: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 15"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Petaling Jaya court"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Create Session'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">No sessions yet.</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{fmt(s.date)}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  RM {s.costPerPerson}/person · {s.attendeeIds.length} attended
                  {s.notes && ` · ${s.notes}`}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/sessions/${s.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Attendance
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-gray-400 hover:text-red-500 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
