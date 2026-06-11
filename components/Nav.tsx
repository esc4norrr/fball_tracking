'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/players', label: 'Players' },
  { href: '/payments', label: 'Payments' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-green-500 text-lg tracking-tight">⚽ Futsal</span>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-green-900/40 text-green-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-950 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
