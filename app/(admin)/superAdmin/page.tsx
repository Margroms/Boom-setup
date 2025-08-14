// app/(admin)/superAdmin/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import clsx from 'clsx';

interface KitchenDoc { _id: Id<'kitchens'>; name: string }

function KitchenMenu({ kitchen }: { kitchen: KitchenDoc }) {
  const menuItems = useQuery(api.menuItems.getByKitchen, { kitchenId: kitchen._id });
  const removeMenuItem = useMutation(api.menuItems.remove);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-neutral-800 text-sm">{kitchen.name}</h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{menuItems?.length ?? 0}</span>
      </div>
      {menuItems === undefined && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-5 rounded bg-neutral-100 animate-pulse" />)}
        </div>
      )}
      <ul className="divide-y divide-neutral-100 text-sm">
        {menuItems?.map(item => (
          <li key={item._id} className="flex items-center justify-between py-2 group">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-neutral-700 truncate">{item.name}</p>
              <p className="text-xs text-neutral-400">₹{item.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => removeMenuItem({ menuItemId: item._id })}
              className="text-[11px] font-medium px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
            >Remove</button>
          </li>
        ))}
        {menuItems?.length === 0 && (
          <li className="py-4 text-xs text-neutral-400 text-center">No items</li>
        )}
      </ul>
    </div>
  );
}

export default function SuperAdminPage() {
  const kitchens = useQuery(api.kitchen.list);
  const createKitchen = useMutation(api.kitchen.create);
  const createMenuItem = useMutation(api.menuItems.create);
  const createMenuItemAll = useMutation(api.menuItems.createForAll);

  const [newKitchenName, setNewKitchenName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [selectedKitchen, setSelectedKitchen] = useState<Id<'kitchens'> | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [creatingKitchen, setCreatingKitchen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreateKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitchenName.trim()) {
      setToast({ type: 'error', message: 'Provide a kitchen name.' });
      return;
    }
    setCreatingKitchen(true);
    try {
      await createKitchen({ name: newKitchenName.trim() });
      setNewKitchenName('');
      setToast({ type: 'success', message: 'Kitchen created!' });
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Failed to create kitchen' });
    } finally { setCreatingKitchen(false); }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) {
      setToast({ type: 'error', message: 'Complete the form.' });
      return;
    }
    setSubmitting(true);
    try {
      if (selectedKitchen === 'ALL') {
        await createMenuItemAll({ name: newItemName.trim(), price: parseFloat(newItemPrice) });
      } else {
        if (!selectedKitchen) throw new Error('Select a kitchen or ALL');
        await createMenuItem({
          name: newItemName.trim(),
          price: parseFloat(newItemPrice),
          kitchenId: selectedKitchen,
        });
      }
      setNewItemName('');
      setNewItemPrice('');
      setToast({ type: 'success', message: 'Item added!' });
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Failed to add item' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Kitchen creation */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Super Admin</h1>
          <div className="text-xs text-neutral-500">Manage kitchens & menus</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-10">
        {/* Kitchen creation */}
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-neutral-700 mb-4">Add New Kitchen</h2>
          <form onSubmit={handleCreateKitchen} className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Kitchen name"
              value={newKitchenName}
              onChange={(e) => setNewKitchenName(e.target.value)}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <button
              type="submit"
              disabled={creatingKitchen}
              className={clsx('rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50', creatingKitchen ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800')}
            >{creatingKitchen ? 'Creating…' : 'Create Kitchen'}</button>
          </form>
          <p className="mt-3 text-[11px] text-neutral-400">Kitchen names must be unique.</p>
        </section>

        {/* Form */}
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-neutral-700 mb-4">Add New Menu Item</h2>
          <form onSubmit={handleAddMenuItem} className="grid gap-3 md:grid-cols-4">
            <select
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value as any)}
              className="md:col-span-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <option value="">Select kitchen</option>
              <option value="ALL">All Kitchens</option>
              {kitchens?.map(k => <option key={k._id} value={k._id}>{k.name}</option>)}
            </select>
            <input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="md:col-span-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <input
              placeholder="Price (₹)"
              type="number"
              min="0"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="md:col-span-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <div className="md:col-span-1 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={clsx('flex-1 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50', submitting ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800')}
              >{submitting ? 'Adding…' : 'Add Item'}</button>
              <button
                type="button"
                onClick={() => { setNewItemName(''); setNewItemPrice(''); }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >Reset</button>
            </div>
          </form>
          <p className="mt-3 text-[11px] text-neutral-400">All fields required. Prices in INR.</p>
        </section>

        {/* Kitchens */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Kitchen Menus</h2>
            {kitchens && <span className="text-xs text-neutral-500">{kitchens.length} kitchens</span>}
          </div>
          {kitchens === undefined && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-lg border bg-white animate-pulse" />)}
            </div>
          )}
          {kitchens?.length === 0 && (
            <div className="rounded-lg border border-dashed bg-white p-10 text-center text-sm text-neutral-500">No kitchens found.</div>
          )}
          {kitchens && kitchens.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {kitchens.map(k => <KitchenMenu key={k._id} kitchen={k} />)}
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