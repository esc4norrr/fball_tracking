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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {pathname !== '/login' && <Nav />}
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">{children}</main>
    </>
  );
}
