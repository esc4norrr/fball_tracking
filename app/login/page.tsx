'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (login(password)) {
      router.replace('/');
    } else {
      setError('Wrong password');
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚽</div>
          <h1 className="text-2xl font-bold text-gray-100">Futsal Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Admin access only</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter password"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
