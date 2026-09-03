'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessions, addSession, deleteSession } from '@/lib/db';
import { Session } from '@/lib/types';
import { Plus, Trash, UsersThree, MapPin, CalendarBlank, ArrowRight } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

function fmt(date: Date) {
  return date.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', costPerPerson: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  async function load() {
    const data = await getSessions();
    setSessions(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
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
    toast.success('Session created');
    await load();
  }

  async function handleDelete(id: string, date: Date) {
    const ok = await confirm({
      title: `Delete ${fmt(date)}?`,
      description: 'Attendance and guest data for this session will be lost. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Session deleted');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Sessions</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} weight="bold" />
          New Session
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleAdd} className="space-y-4">
            <h2 className="font-medium text-text text-sm">New Session</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" htmlFor="date">
                <Input
                  id="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Cost per person (RM)" htmlFor="cost">
                <Input
                  id="cost"
                  type="number"
                  required
                  min="0"
                  step="0.50"
                  value={form.costPerPerson}
                  onChange={(e) => setForm({ ...form, costPerPerson: e.target.value })}
                  placeholder="e.g. 15"
                />
              </Field>
            </div>
            <Field label="Notes (optional)" htmlFor="notes">
              <Input
                id="notes"
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Petaling Jaya court"
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create Session'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarBlank}
            title="No sessions yet"
            description="Create your first session to start tracking attendance and cost."
            action={
              <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                <Plus size={14} weight="bold" />
                New Session
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const guestTotal = Object.values(s.guestCounts ?? {}).reduce((sum, n) => sum + n, 0);
            return (
              <Card key={s.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:border-border-strong transition-colors">
                <Link href={`/sessions/${s.id}`} className="min-w-0 flex-1 group">
                  <div className="font-medium text-text text-sm flex items-center gap-2">
                    {fmt(s.date)}
                    <ArrowRight size={13} className="text-text-faint opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-faint mt-1">
                    <span>RM {s.costPerPerson}/person</span>
                    <span className="flex items-center gap-1">
                      <UsersThree size={13} />
                      {s.attendeeIds.length} attended
                      {guestTotal > 0 && ` + ${guestTotal} guest${guestTotal !== 1 ? 's' : ''}`}
                    </span>
                    {s.notes && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {s.notes}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/sessions/${s.id}`}>
                    <Button variant="secondary" size="sm">Attendance</Button>
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id, s.date)}
                    aria-label="Delete session"
                    className="p-2 rounded-lg text-text-faint hover:text-danger hover:bg-danger-strong/10 transition-colors"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
