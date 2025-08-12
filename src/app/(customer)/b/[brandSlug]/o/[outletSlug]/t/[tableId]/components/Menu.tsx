'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Mock data structure - replace with actual query result
const mockMenuItems = [
  { id: 'item1', name: 'Vada Pav', price: 20 },
  { id: 'item2', name: 'Samosa', price: 25 },
  { id: 'item3', name: 'Dabeli', price: 30 },
]

export default function Menu({ outletId }: { outletId: string }) {
  // This hook provides real-time updates from Convex.
  // const inventory = useQuery(api.queries.inventoryByOutlet, { outletId });

  const handleAddToCart = (itemId: string) => {
    console.log(`Adding ${itemId} to cart.`);
    // Call Convex mutation here: upsertCartItem({ itemId, qty: 1 });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Menu</h2>
      <div className="space-y-3">
        {mockMenuItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-bold">{item.name}</p>
              <p>₹{item.price.toFixed(2)}</p>
            </div>
            {/* Real inventory would disable this button */}
            <button
              onClick={() => handleAddToCart(item.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}