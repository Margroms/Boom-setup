'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/src/lib/auth-client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        // Set a simple session in localStorage for demo
        localStorage.setItem('auth-session', JSON.stringify({ user: { email } }));
        const redirect = searchParams.get('redirect') || '/';
        window.location.href = redirect;
      } else {
        throw new Error('Sign in failed');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to sign in');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-lg font-semibold">Sign in</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2 text-sm" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-md bg-neutral-900 text-white py-2 text-sm font-medium disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}


