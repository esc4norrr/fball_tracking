export interface Player {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  date: Date;
  costPerPerson: number;
  notes: string;
  attendeeIds: string[];
  guestCounts?: Record<string, number>; // playerId -> number of guests (+1s) they brought
}

export interface Payment {
  id: string;
  playerId: string;
  amount: number;
  date: Date;
  notes: string;
}

export interface PlayerStats {
  player: Player;
  sessionsAttended: number;
  amountOwed: number;
  guestAmountOwed: number; // portion of amountOwed from guests (+1s) this player brought
  amountPaid: number;
  balance: number; // positive = credit, negative = owes
}
