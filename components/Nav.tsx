'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  SoccerBall,
  SquaresFour,
  CalendarBlank,
  Users,
  Wallet,
  SignOut,
  type Icon,
} from '@phosphor-icons/react';

const links: { href: string; label: string; icon: Icon }[] = [
  { href: '/', label: 'Dashboard', icon: SquaresFour },
  { href: '/sessions', label: 'Sessions', icon: CalendarBlank },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/payments', label: 'Payments', icon: Wallet },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <nav className="bg-surface/95 backdrop-blur border-b border-border sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-1.5 text-text font-semibold text-sm shrink-0">
          <SoccerBall size={20} weight="fill" className="text-accent-text" />
          <span>Futsal</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {links.map((l) => {
            const active = pathname === l.href;
            const LinkIcon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-accent/15 text-accent-text' : 'text-text-muted hover:text-text hover:bg-surface-3'
                }`}
              >
                <LinkIcon size={16} weight={active ? 'fill' : 'regular'} />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex items-center gap-1.5 ml-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium text-text-faint hover:text-danger hover:bg-danger-strong/10 transition-colors"
          >
            <SignOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
