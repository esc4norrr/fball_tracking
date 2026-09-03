'use client';
import { useEffect, useState } from 'react';
import { getPlayers, getSessions, getPayments } from '@/lib/db';
import { PlayerStats, Session } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { formatAmount, formatRM } from '@/lib/format';
import { CalendarBlank, Users, CurrencyCircleDollar, CaretDown, UsersThree } from '@phosphor-icons/react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

// A player is auto-hidden once they've missed the last 3 sessions and are fully settled up.
const RECENT_SESSIONS_WINDOW = 3;
const BALANCE_EPSILON = 0.005;

function computeVisibility(players: PlayerStats[], sessions: Session[]): Set<string> {
  const recentSessionIds = new Set(sessions.slice(0, RECENT_SESSIONS_WINDOW).map((s) => s.id));
  const recentAttendeeIds = new Set(
    sessions.filter((s) => recentSessionIds.has(s.id)).flatMap((s) => s.attendeeIds)
  );
  const visible = new Set<string>();
  for (const stat of players) {
    if (recentAttendeeIds.has(stat.player.id) || Math.abs(stat.balance) > BALANCE_EPSILON) {
      visible.add(stat.player.id);
    }
  }
  return visible;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    async function load() {
      const [players, sessions, payments] = await Promise.all([
        getPlayers(),
        getSessions(),
        getPayments(),
      ]);
      setTotalSessions(sessions.length);
      const computed = computeStats(players, sessions, payments);
      setStats(computed);
      setVisibleIds(computeVisibility(computed, sessions));
      setLoading(false);
    }
    load();
  }, []);

  const totalOwed = stats.reduce((s, p) => s + p.amountOwed, 0);
  const totalPaid = stats.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = Math.max(0, totalOwed - totalPaid);

  const visibleStats = showAll ? stats : stats.filter((s) => visibleIds.has(s.player.id));
  const hiddenCount = stats.length - visibleStats.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold text-text">Dashboard</h1>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={CalendarBlank} label="Sessions" value={totalSessions} />
        <StatCard icon={Users} label="Players" value={stats.length} />
        <StatCard
          icon={CurrencyCircleDollar}
          label="Outstanding"
          value={formatAmount(totalOutstanding)}
          tone={totalOutstanding > 0 ? 'danger' : 'neutral'}
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} cols={5} />
            ))}
          </div>
        ) : stats.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No players yet"
            description="Add players in the Players tab to start tracking sessions and balances."
          />
        ) : visibleStats.length === 0 ? (
          <EmptyState
            icon={UsersThree}
            title="Everyone's settled up"
            description="No one has an outstanding balance or recent attendance to show."
            action={
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-accent-text hover:underline"
              >
                Show all {stats.length} players anyway
              </button>
            }
          />
        ) : (
          <>
            {/* Mobile: stacked cards — fits one column, nothing cropped off-screen when screenshotted */}
            <div className="sm:hidden divide-y divide-border/60">
              {visibleStats.map((s) => (
                <div key={s.player.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-text text-sm truncate">{s.player.name}</div>
                    <div className="text-xs text-text-faint mt-0.5 tabular-nums">
                      {s.sessionsAttended} sessions · Owed {formatAmount(s.amountOwed)}
                      {s.guestAmountOwed > 0 && (
                        <span className="text-warn"> (+{formatAmount(s.guestAmountOwed)})</span>
                      )}
                      {' '}· Paid {formatAmount(s.amountPaid)}
                    </div>
                  </div>
                  <span className={`font-semibold tabular-nums text-base shrink-0 ${s.balance >= 0 ? 'text-accent-text' : 'text-danger'}`}>
                    {s.balance >= 0 ? '+' : ''}
                    {formatAmount(s.balance)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tablet/desktop: full table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-3/50">
                    <th className="text-left px-4 py-3 font-medium text-text-faint">Player</th>
                    <th className="text-right px-4 py-3 font-medium text-text-faint">Sessions</th>
                    <th className="text-right px-4 py-3 font-medium text-text-faint">Owed (RM)</th>
                    <th className="text-right px-4 py-3 font-medium text-text-faint">Paid (RM)</th>
                    <th className="text-right px-4 py-3 font-medium text-text-faint">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStats.map((s) => (
                    <tr key={s.player.id} className="border-b border-border/60 last:border-0 hover:bg-surface-3/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-text">{s.player.name}</td>
                      <td className="px-4 py-3 text-right text-text-muted tabular-nums">{s.sessionsAttended}</td>
                      <td className="px-4 py-3 text-right text-text-muted tabular-nums">
                        {formatAmount(s.amountOwed)}
                        {s.guestAmountOwed > 0 && (
                          <span
                            className="text-warn ml-1"
                            title={`Includes ${formatRM(s.guestAmountOwed)} from guests they brought`}
                          >
                            (+{formatAmount(s.guestAmountOwed)})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-text-muted tabular-nums">{formatAmount(s.amountPaid)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold tabular-nums ${s.balance >= 0 ? 'text-accent-text' : 'text-danger'}`}>
                          {s.balance >= 0 ? '+' : ''}
                          {formatAmount(s.balance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-border text-xs text-text-faint hover:text-text-muted hover:bg-surface-3/40 transition-colors"
              >
                <CaretDown size={12} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
                {showAll
                  ? 'Hide settled/inactive players'
                  : `Show ${hiddenCount} settled player${hiddenCount !== 1 ? 's' : ''} inactive for 3+ sessions`}
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
