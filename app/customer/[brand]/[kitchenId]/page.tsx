'use client';

import { useState, useMemo, use } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import clsx from 'clsx';

interface CartItem { menuItemId: Id<'menuItems'>; name: string; price: number; quantity: number }

type PageProps = { params: Promise<{ brand: string; kitchenId: string }>; };

const ALLOWED_BRANDS = new Set(['nippu-kodi','el-chaplo','booms-pizza']);

export default function CustomerBrandKitchenPage({ params }: PageProps) {
  const { brand, kitchenId: rawKitchenId } = use(params);
  if (!ALLOWED_BRANDS.has(brand)) {
    // Render nothing (Next will show 404 if wrapped with notFound at server). For client route keep it simple.
  }
  const KITCHEN_ID = rawKitchenId as Id<'kitchens'>;
  const menuItems = useQuery(api.menuItems.getByKitchen, { kitchenId: KITCHEN_ID });
  const placeOrder = useMutation(api.orders.create);

  const [cart, setCart] = useState<Map<Id<'menuItems'>, CartItem>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const addToCart = (item: { _id: Id<'menuItems'>; name: string; price: number }) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(item._id);
      if (existing) next.set(item._id, { ...existing, quantity: existing.quantity + 1 });
      else next.set(item._id, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 });
      return next;
    });
  };

  const updateQuantity = (id: Id<'menuItems'>, delta: number) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (!existing) return prev;
      const q = existing.quantity + delta;
      if (q <= 0) next.delete(id); else next.set(id, { ...existing, quantity: q });
      return next;
    });
  };

  const clearCart = () => setCart(new Map());
  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
  const cartSubtotal = useMemo(() => cartItems.reduce((s, i) => s + i.price * i.quantity, 0), [cartItems]);

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return setToast({ type: 'error', message: 'Cart empty' });
    setSubmitting(true); setToast(null);
    try {
      await new Promise(r => setTimeout(r, 300));
      await placeOrder({ kitchenId: KITCHEN_ID, items: cartItems.map(ci => ({ menuItemId: ci.menuItemId, quantity: ci.quantity })) });
      clearCart();
      setToast({ type: 'success', message: 'Order placed!' });
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Failed' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight capitalize">{brand.replace('-', ' ')}</h1>
          <div className="text-xs text-neutral-500">Kitchen <span className="font-mono">{KITCHEN_ID}</span></div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Menu</h2>
            {menuItems && <span className="text-xs text-neutral-500">{menuItems.length} items</span>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems === undefined && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}
            {menuItems?.map(item => (
              <div key={item._id} className="group relative rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col h-full">
                  {item.imageUrl && (
                    <div className="relative w-full aspect-square mb-3 overflow-hidden rounded">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-medium text-neutral-800 mb-1 line-clamp-2">{item.name}</h3>
                  <div className="text-sm text-neutral-500 mb-3">₹{item.price.toFixed(2)}</div>
                  <button onClick={() => addToCart(item)} className="mt-auto inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50">Add</button>
                </div>
              </div>
            ))}
            {menuItems?.length === 0 && <div className="col-span-full text-center text-sm text-neutral-500 py-10 border border-dashed rounded-lg">No menu items.</div>}
          </div>
        </section>
        <aside className="md:col-span-1 h-fit sticky top-24 space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-medium mb-3">Your Cart</h2>
            {!cartItems.length && <p className="text-sm text-neutral-500">Cart is empty.</p>}
            <ul className="divide-y divide-neutral-100">
              {cartItems.map(ci => (
                <li key={ci.menuItemId} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{ci.name}</p>
                    <p className="text-xs text-neutral-500">₹{ci.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(ci.menuItemId, -1)} className="h-6 w-6 inline-flex items-center justify-center rounded border text-xs font-medium hover:bg-neutral-100" aria-label="Decrease">−</button>
                    <span className="w-6 text-center text-sm tabular-nums">{ci.quantity}</span>
                    <button onClick={() => updateQuantity(ci.menuItemId, +1)} className="h-6 w-6 inline-flex items-center justify-center rounded border text-xs font-medium hover:bg-neutral-100" aria-label="Increase">+</button>
                  </div>
                </li>
              ))}
            </ul>
            {cartItems.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium text-neutral-800">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-neutral-400">Taxes at counter.</div>
                <div className="flex gap-2">
                  <button onClick={clearCart} className="flex-1 inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50" disabled={!cartItems.length || submitting}>Clear</button>
                  <button onClick={handlePlaceOrder} disabled={!cartItems.length || submitting} className={clsx('flex-1 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50', submitting ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800')}>{submitting ? 'Placing…' : 'Place Order'}</button>
                </div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-neutral-400 text-center">Convex demo</div>
        </aside>
      </main>
      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"><div className={clsx('px-4 py-2 rounded-md shadow-md text-sm font-medium', toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white')}>{toast.message}</div></div>}
    </div>
  );
}


