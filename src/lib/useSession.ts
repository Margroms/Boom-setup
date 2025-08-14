'use client';
import { useEffect, useState } from 'react';

export function useSession() {
  const [data, setData] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem('auth-session');
      setData(session ? JSON.parse(session) : null);
    } catch (e) {
      setData(null);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { data, isPending };
}


