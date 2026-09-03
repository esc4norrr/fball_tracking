'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Nav from './Nav';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === '/login') {
      setReady(true);
      return;
    }
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {pathname !== '/login' && <Nav />}
      <main className="flex-1 bg-surface">{children}</main>
    </>
  );
}
