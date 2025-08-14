// app/customer/page.tsx
'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function CustomerEntryPage() {
  const kitchens = useQuery(api.kitchen.list);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-center mb-2">Choose a Kitchen</h1>
        <p className="text-sm text-neutral-500 text-center mb-6">Select your location to start ordering.</p>
        <div className="space-y-3">
          {kitchens === undefined && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-md bg-white border animate-pulse" />)}
          {kitchens?.map(k => (
            <Link key={k._id} href={`/customer/${k._id}`} className="block group rounded-md border bg-white px-4 py-3 shadow-sm hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-800 group-hover:text-neutral-900">{k.name}</span>
                <span className="text-[10px] font-mono text-neutral-400">{k._id.slice(-6)}</span>
              </div>
            </Link>
          ))}
          {kitchens?.length === 0 && <div className="text-center text-sm text-neutral-500 py-10 border border-dashed rounded-md bg-white">No kitchens available.</div>}
        </div>
      </div>
    </div>
  );
}