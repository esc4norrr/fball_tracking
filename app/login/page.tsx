'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { SoccerBall, Eye, EyeSlash } from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[100dvh] flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
            <SoccerBall size={24} weight="fill" className="text-accent-text" />
          </div>
          <h1 className="text-xl font-semibold text-text">Futsal Tracker</h1>
          <p className="text-text-faint text-sm mt-1">Admin access only</p>
        </div>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Password" htmlFor="password" error={error}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  autoFocus
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
