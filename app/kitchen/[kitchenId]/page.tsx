// app/kitchen/[kitchenId]/page.tsx
'use client';

import { useState, useMemo, use } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import clsx from 'clsx';

// Status pipeline definition
const ORDER_STATUSES = ['placed', 'preparing', 'ready', 'served'] as const;

type PageProps = { params: Promise<{ kitchenId: string }> };

interface StatusConfig {
  value: typeof ORDER_STATUSES[number];
  label: string;
  color: string;
  next?: typeof ORDER_STATUSES[number];
}

const STATUS_META: StatusConfig[] = [
  { value: 'placed', label: 'Placed', color: 'bg-blue-100 text-blue-700 border-blue-200', next: 'preparing' },
  { value: 'preparing', label: 'Preparing', color: 'bg-amber-100 text-amber-700 border-amber-200', next: 'ready' },
  { value: 'ready', label: 'Ready', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', next: 'served' },
  { value: 'served', label: 'Served', color: 'bg-neutral-200 text-neutral-700 border-neutral-300' },
];

export default function KitchenPage({ params }: PageProps) {
  const { kitchenId: rawKitchenId } = use(params);
  const kitchenId = rawKitchenId as Id<'kitchens'>;
  const orders = useQuery(api.orders.getByKitchen, { kitchenId });
  const updateStatus = useMutation(api.orders.updateStatus);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updating, setUpdating] = useState<Id<'orders'> | null>(null);

  const grouped = useMemo(() => {
    if (!orders) return {} as Record<string, any[]>;
    return orders.reduce((acc: Record<string, any[]>, o) => {
      (acc[o.status] ||= []).push(o);
      return acc;
    }, {});
  }, [orders]);

  const handleStatusUpdate = async (orderId: Id<'orders'>, status: typeof ORDER_STATUSES[number]) => {
    setUpdating(orderId);
    try {
      await updateStatus({ orderId, status });
      setToast({ type: 'success', message: `Order updated to ${status}` });
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Failed to update status' });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusMeta = (value: string) => STATUS_META.find(s => s.value === value)!;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Kitchen Dashboard</h1>
            <div className="text-xs text-neutral-500 font-mono">Kitchen: {kitchenId}</div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth-session');
              window.location.href = '/sign-in';
            }}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-8">
        {/* Status overview */}
        <section>
          <h2 className="text-sm font-medium text-neutral-700 mb-3">Pipeline Overview</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {STATUS_META.map(s => (
              <div key={s.value} className="rounded-lg border bg-white p-4 flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-neutral-500">{s.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{grouped[s.value]?.length || 0}</span>
                </div>
                <div className="h-2 rounded bg-neutral-100 relative overflow-hidden">
                  <div
                    className={clsx('h-full transition-all', s.value === 'placed' && 'bg-blue-400', s.value === 'preparing' && 'bg-amber-400', s.value === 'ready' && 'bg-emerald-400', s.value === 'served' && 'bg-neutral-400')} 
                    style={{ width: `${Math.min((grouped[s.value]?.length || 0) * 30, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders board */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Active Orders</h2>
            {orders && <span className="text-xs text-neutral-500">{orders.length} total</span>}
          </div>

            {orders === undefined && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-lg border bg-white animate-pulse" />
                ))}
              </div>
            )}

            {orders?.length === 0 && (
              <div className="rounded-lg border border-dashed bg-white p-10 text-center text-sm text-neutral-500">No orders yet.</div>
            )}

            {orders && orders.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map(order => {
                  const meta = getStatusMeta(order.status);
                  const nextStatus = meta.next;
                  return (
                    <div key={order._id} className="relative rounded-lg border bg-white p-4 shadow-sm flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs text-neutral-400 tracking-wide">ORDER</p>
                          <h3 className="font-semibold text-neutral-800 text-sm">#{order._id.slice(-6)}</h3>
                        </div>
                        <span className={clsx('text-[11px] px-2 py-1 rounded-full border font-medium', meta.color)}>{meta.label}</span>
                      </div>
                      <ul className="text-xs text-neutral-600 space-y-1 mb-3">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span className="truncate max-w-[65%]">{item.name}</span>
                            <span className="font-mono tabular-nums text-neutral-500">×{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium text-neutral-800">₹{order.totalAmount.toFixed(2)}</span>
                        <div className="flex gap-1">
                          {ORDER_STATUSES.filter(s => s !== order.status).map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusUpdate(order._id as Id<'orders'>, s)}
                              className={clsx('h-7 w-7 rounded text-[10px] font-medium border flex items-center justify-center hover:bg-neutral-100 transition', s === nextStatus ? 'border-neutral-800 text-neutral-900' : 'border-neutral-200 text-neutral-500')}
                              disabled={updating === order._id}
                              title={`Set to ${s}`}
                            >{s[0].toUpperCase()}</button>
                          ))}
                        </div>
                      </div>
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusUpdate(order._id as Id<'orders'>, nextStatus)}
                          disabled={updating === order._id}
                          className={clsx('mt-3 w-full inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50', updating === order._id ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800')}
                        >Advance to {getStatusMeta(nextStatus).label}</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={clsx('px-4 py-2 rounded-md shadow-md text-sm font-medium', toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}


