import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Futsal Tracker',
  description: 'Track futsal sessions, attendance, and payments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased dark`}>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
