import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Session, Payment } from './types';

// Players
export async function getPlayers(): Promise<Player[]> {
  const q = query(collection(db, 'players'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    createdAt: (d.data().createdAt as Timestamp).toDate(),
  }));
}

export async function addPlayer(name: string): Promise<void> {
  await addDoc(collection(db, 'players'), {
    name: name.trim(),
    createdAt: Timestamp.now(),
  });
}

export async function deletePlayer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'players', id));
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    date: (d.data().date as Timestamp).toDate(),
    costPerPerson: d.data().costPerPerson ?? 0,
    notes: d.data().notes ?? '',
    attendeeIds: d.data().attendeeIds ?? [],
    guestCounts: d.data().guestCounts ?? {},
  }));
}

export async function getSession(id: string): Promise<Session | null> {
  const snap = await getDoc(doc(db, 'sessions', id));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    date: (snap.data().date as Timestamp).toDate(),
    costPerPerson: snap.data().costPerPerson ?? 0,
    notes: snap.data().notes ?? '',
    attendeeIds: snap.data().attendeeIds ?? [],
    guestCounts: snap.data().guestCounts ?? {},
  };
}

export async function addSession(data: Omit<Session, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    ...data,
    date: Timestamp.fromDate(data.date),
  });
  return ref.id;
}

export async function updateSession(
  id: string,
  data: Partial<Omit<Session, 'id'>>
): Promise<void> {
  const update: Record<string, unknown> = { ...data };
  if (data.date) update.date = Timestamp.fromDate(data.date);
  await updateDoc(doc(db, 'sessions', id), update);
}

export async function deleteSession(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', id));
}

// Payments
export async function getPayments(): Promise<Payment[]> {
  const q = query(collection(db, 'payments'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    playerId: d.data().playerId,
    amount: d.data().amount,
    date: (d.data().date as Timestamp).toDate(),
    notes: d.data().notes ?? '',
  }));
}

export async function addPayment(data: Omit<Payment, 'id'>): Promise<void> {
  await addDoc(collection(db, 'payments'), {
    ...data,
    date: Timestamp.fromDate(data.date),
  });
}

export async function deletePayment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'payments', id));
}
