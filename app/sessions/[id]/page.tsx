'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, getPlayers, updateSession } from '@/lib/db';
import { Session, Player } from '@/lib/types';

function fmt(date: Date) {
  return date.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [sess, pl] = await Promise.all([getSession(id), getPlayers()]);
      if (!sess) { router.replace('/sessions'); return; }
      setSession(sess);
      setPlayers(pl);
      setAttendeeIds(sess.attendeeIds);
      setLoading(false);
    }
    load();
  }, [id, router]);

  function toggle(playerId: string) {
    setAttendeeIds((prev) =>
      prev.includes(playerId) ? prev.filter((x) => x !== playerId) : [...prev, playerId]
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await updateSession(id, { attendeeIds });
    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-6 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <button onClick={() => router.push('/sessions')} className="text-sm text-gray-500 hover:text-gray-700 mb-3 inline-block">
          ← Sessions
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{session && fmt(session.date)}</h1>
        {session && (
          <p className="text-gray-500 text-sm mt-1">
            RM {session.costPerPerson} per person{session.notes ? ` · ${session.notes}` : ''}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Attendance <span className="text-gray-400 font-normal text-sm">({attendeeIds.length}/{players.length})</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => { setAttendeeIds(players.map((p) => p.id)); setSaved(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              All
            </button>
            <button
              onClick={() => { setAttendeeIds([]); setSaved(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              None
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <p className="text-gray-400 text-sm">No players yet. Add some in the Players tab.</p>
        ) : (
          <div className="space-y-2">
            {players.map((p) => {
              const checked = attendeeIds.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border transition-colors ${
                    checked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(p.id)}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className={`text-sm font-medium ${checked ? 'text-green-800' : 'text-gray-700'}`}>
                    {p.name}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Attendance'}
          </button>
          {saved && <span className="text-green-600 text-sm">Saved ✓</span>}
        </div>
      </div>
    </div>
  );
}
