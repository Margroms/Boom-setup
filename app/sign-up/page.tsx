'use client';
import { useState } from 'react';
import { authClient } from '@/src/lib/auth-client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        window.location.href = '/sign-in';
      } else {
        throw new Error('Sign up failed');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to sign up');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-lg font-semibold">Create account</h1>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-md border px-3 py-2 text-sm" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-md bg-neutral-900 text-white py-2 text-sm font-medium disabled:opacity-50">{loading ? 'Creating…' : 'Sign up'}</button>
        <a href="/sign-in" className="block text-center text-xs text-neutral-500 hover:underline">Already have an account? Sign in</a>
      </form>
    </div>
  );
}


