'use client';
import { ReactNode, useEffect } from 'react';
import { useSession } from '@/src/lib/useSession';

export default function KitchenLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      const redirect = encodeURIComponent('/kitchen');
      window.location.href = `/sign-in?redirect=${redirect}`;
    }
  }, [isPending, session]);

  if (isPending) return <div className="p-6 text-sm text-neutral-500">Checking access…</div>;
  if (!session) return null;
  
  return <>{children}</>;
}


