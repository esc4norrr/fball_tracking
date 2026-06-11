'use client';
import { useEffect, useState } from 'react';
import { getPlayers, addPlayer, deletePlayer } from '@/lib/db';
import { Player } from '@/lib/types';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await getPlayers();
    setPlayers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await addPlayer(name.trim());
    setName('');
    setSaving(false);
    await load();
  }

  async function handleDelete(id: string, playerName: string) {
    if (!confirm(`Remove ${playerName}? Their attendance history will remain on sessions.`)) return;
    await deletePlayer(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Players</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Add Player</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Player name"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>
      ) : players.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">No players yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3.5 ${
                i < players.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-900">{p.name}</span>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="text-gray-400 hover:text-red-500 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">
        {players.length} player{players.length !== 1 ? 's' : ''} total
      </p>
    </div>
  );
}
