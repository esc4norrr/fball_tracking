'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPlayers, addPlayer, deletePlayer } from '@/lib/db';
import { Player } from '@/lib/types';
import { MagnifyingGlass, Plus, Trash, Users } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  async function load() {
    const data = await getPlayers();
    setPlayers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await addPlayer(name.trim());
    setName('');
    setSaving(false);
    toast.success('Player added');
    await load();
  }

  async function handleDelete(id: string, playerName: string) {
    const ok = await confirm({
      title: `Remove ${playerName}?`,
      description: 'Their attendance and payment history will remain on past sessions.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    await deletePlayer(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    toast.success('Player removed');
  }

  const filtered = useMemo(
    () => players.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())),
    [players, query]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold text-text">Players</h1>

      <Card className="p-5">
        <h2 className="font-medium text-text text-sm mb-3">Add Player</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={saving || !name.trim()}>
            <Plus size={16} weight="bold" />
            {saving ? 'Adding…' : 'Add'}
          </Button>
        </form>
      </Card>

      {!loading && players.length > 5 && (
        <div className="relative">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players…"
            className="pl-9"
          />
        </div>
      )}

      {loading ? (
        <Card className="overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60 last:border-0">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          ))}
        </Card>
      ) : players.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title="No players yet" description="Add your first player above." />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={MagnifyingGlass} title="No matches" description={`Nobody named "${query}".`} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 last:border-0 hover:bg-surface-3/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-accent/15 text-accent-text text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials(p.name)}
                </div>
                <span className="text-sm font-medium text-text truncate">{p.name}</span>
              </div>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                aria-label={`Remove ${p.name}`}
                className="p-1.5 rounded-lg text-text-faint hover:text-danger hover:bg-danger-strong/10 transition-colors shrink-0"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}
      <p className="text-xs text-text-faint">
        {players.length} player{players.length !== 1 ? 's' : ''} total
      </p>
    </div>
  );
}
