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
  amountPaid: number;
  balance: number; // positive = credit, negative = owes
}
