'use client';
import { useEffect, useState } from 'react';
import { getPlayers, getSessions, getPayments } from '@/lib/db';
import { PlayerStats, Player, Session, Payment } from '@/lib/types';

function computeStats(players: Player[], sessions: Session[], payments: Payment[]): PlayerStats[] {
  return players.map((player) => {
    const attended = sessions.filter((s) => s.attendeeIds.includes(player.id));
    const amountOwed = attended.reduce((sum, s) => sum + s.costPerPerson, 0);
    const amountPaid = payments
      .filter((p) => p.playerId === player.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      player,
      sessionsAttended: attended.length,
      amountOwed,
      amountPaid,
      balance: amountPaid - amountOwed,
    };
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
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
      setStats(computeStats(players, sessions, payments));
      setLoading(false);
    }
    load();
  }, []);

  const totalOwed = stats.reduce((s, p) => s + p.amountOwed, 0);
  const totalPaid = stats.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = Math.max(0, totalOwed - totalPaid);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Sessions" value={totalSessions} />
        <StatCard label="Players" value={stats.length} />
        <StatCard label="Outstanding (RM)" value={totalOutstanding.toFixed(0)} highlight />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm py-8 text-center">Loading...</div>
      ) : stats.length === 0 ? (
        <div className="text-gray-500 text-sm py-8 text-center">
          No players yet — add some in the Players tab.
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-400">Player</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-400">Sessions</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-400">Owed (RM)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-400">Paid (RM)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={s.player.id} className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}>
                    <td className="px-4 py-3 font-medium text-gray-100">{s.player.name}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{s.sessionsAttended}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{s.amountOwed.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{s.amountPaid.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${s.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {s.balance >= 0 ? '+' : ''}{s.balance.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border shadow-sm ${
      highlight
        ? 'bg-red-950/50 border-red-900'
        : 'bg-gray-900 border-gray-800'
    }`}>
      <div className={`text-2xl font-bold ${highlight ? 'text-red-400' : 'text-gray-100'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
