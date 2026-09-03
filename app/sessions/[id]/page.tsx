'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, getPlayers, updateSession } from '@/lib/db';
import { Session, Player } from '@/lib/types';
import { ArrowLeft, Check, Minus, Plus, Users } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

function fmt(date: Date) {
  return date.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    async function load() {
      const [sess, pl] = await Promise.all([getSession(id), getPlayers()]);
      if (!sess) { router.replace('/sessions'); return; }
      setSession(sess);
      setPlayers(pl);
      setAttendeeIds(sess.attendeeIds);
      setGuestCounts(sess.guestCounts ?? {});
      setLoading(false);
    }
    load();
  }, [id, router]);

  function toggle(playerId: string) {
    setAttendeeIds((prev) =>
      prev.includes(playerId) ? prev.filter((x) => x !== playerId) : [...prev, playerId]
    );
    // Guests only count for attending players — clear them when unchecking.
    setGuestCounts((prev) => {
      if (attendeeIds.includes(playerId) && prev[playerId]) {
        const next = { ...prev };
        delete next[playerId];
        return next;
      }
      return prev;
    });
    setDirty(true);
  }

  function setGuestCount(playerId: string, count: number) {
    const clamped = Math.max(0, count);
    setGuestCounts((prev) => {
      const next = { ...prev };
      if (clamped === 0) {
        delete next[playerId];
      } else {
        next[playerId] = clamped;
      }
      return next;
    });
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    await updateSession(id, { attendeeIds, guestCounts });
    setSaving(false);
    setDirty(false);
    toast.success('Attendance saved');
  }

  const totalGuests = Object.values(guestCounts).reduce((sum, n) => sum + n, 0);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-64" />
        <Card className="p-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <button
          onClick={() => router.push('/sessions')}
          className="flex items-center gap-1 text-sm text-text-faint hover:text-text-muted mb-3 transition-colors"
        >
          <ArrowLeft size={14} />
          Sessions
        </button>
        <h1 className="text-xl font-semibold text-text">{session && fmt(session.date)}</h1>
        {session && (
          <p className="text-text-faint text-sm mt-1">
            RM {session.costPerPerson} per person{session.notes ? ` · ${session.notes}` : ''}
          </p>
        )}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-text text-sm">
            Attendance{' '}
            <span className="text-text-faint font-normal">
              ({attendeeIds.length}/{players.length}{totalGuests > 0 ? ` + ${totalGuests} guest${totalGuests !== 1 ? 's' : ''}` : ''})
            </span>
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => { setAttendeeIds(players.map((p) => p.id)); setDirty(true); }}
              className="text-xs text-text-faint hover:text-text-muted px-2 py-1 rounded-md hover:bg-surface-3 transition-colors"
            >
              All
            </button>
            <button
              onClick={() => { setAttendeeIds([]); setDirty(true); }}
              className="text-xs text-text-faint hover:text-text-muted px-2 py-1 rounded-md hover:bg-surface-3 transition-colors"
            >
              None
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <EmptyState icon={Users} title="No players yet" description="Add some in the Players tab first." />
        ) : (
          <div className="space-y-1.5">
            {players.map((p) => {
              const checked = attendeeIds.includes(p.id);
              const guests = guestCounts[p.id] ?? 0;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                    checked
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-surface-3/40 border-border hover:bg-surface-3'
                  }`}
                >
                  <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <span
                      onClick={() => toggle(p.id)}
                      className={`w-4.5 h-4.5 shrink-0 rounded-md flex items-center justify-center border transition-colors ${
                        checked ? 'bg-accent border-accent' : 'border-border-strong'
                      }`}
                    >
                      {checked && <Check size={12} weight="bold" className="text-black" />}
                    </span>
                    <span className={`text-sm font-medium truncate ${checked ? 'text-text' : 'text-text-muted'}`}>
                      {p.name}
                    </span>
                  </label>
                  {checked && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-text-faint mr-0.5">+1s</span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(p.id, guests - 1)}
                        disabled={guests === 0}
                        aria-label={`Decrease guests for ${p.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-3 border border-border text-text-muted hover:bg-border-strong disabled:opacity-40 transition-colors"
                      >
                        <Minus size={11} weight="bold" />
                      </button>
                      <span className="w-4 text-center text-sm font-semibold text-text tabular-nums">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(p.id, guests + 1)}
                        aria-label={`Increase guests for ${p.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-3 border border-border text-text-muted hover:bg-border-strong transition-colors"
                      >
                        <Plus size={11} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button variant="primary" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? 'Saving…' : dirty ? 'Save Attendance' : 'Saved'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
