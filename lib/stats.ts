import { Player, Session, Payment, PlayerStats } from './types';

/** Per-player totals: sessions attended, amount owed (including guests they brought), amount paid, and balance. */
export function computeStats(players: Player[], sessions: Session[], payments: Payment[]): PlayerStats[] {
  return players.map((player) => {
    const attended = sessions.filter((s) => s.attendeeIds.includes(player.id));
    const ownOwed = attended.reduce((sum, s) => sum + s.costPerPerson, 0);
    const guestAmountOwed = attended.reduce(
      (sum, s) => sum + s.costPerPerson * (s.guestCounts?.[player.id] ?? 0),
      0
    );
    const amountOwed = ownOwed + guestAmountOwed;
    const amountPaid = payments
      .filter((p) => p.playerId === player.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      player,
      sessionsAttended: attended.length,
      amountOwed,
      guestAmountOwed,
      amountPaid,
      balance: amountPaid - amountOwed,
    };
  });
}
