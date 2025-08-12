'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Mock order data
const mockOrders = [
    { orderId: 'ORD123', tableId: 'T1', status: 'PAID', items: [{ name: 'Vada Pav', qty: 2 }] },
    { orderId: 'ORD124', tableId: 'T3', status: 'PREPARING', items: [{ name: 'Samosa', qty: 4 }] },
];

export default function OrderList({ outletId }: { outletId: string }) {
  // This real-time query is the core of the kitchen dashboard.
  // const orders = useQuery(api.queries.ordersByOutlet, { outletId });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // Call Convex mutation here: updateOrderStatus({ orderId, newStatus });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mockOrders.map((order) => (
        <div key={order.orderId} className="border rounded-lg p-4 shadow-md bg-white">
          <h3 className="font-bold text-lg">Order #{order.orderId}</h3>
          <p className="text-gray-600">Table: {order.tableId}</p>
          <span className={`inline-block px-2 py-1 text-sm rounded-full ${
            order.status === 'PAID' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
          }`}>
            {order.status}
          </span>
          <ul className="my-3 space-y-1">
            {order.items.map((item, index) => (
              <li key={index}>- {item.name} (x{item.qty})</li>
            ))}
          </ul>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleUpdateStatus(order.orderId, 'PREPARING')}
              className="bg-yellow-500 text-white px-3 py-1 rounded w-full"
            >
              Prepare
            </button>
            <button
              onClick={() => handleUpdateStatus(order.orderId, 'READY')}
              className="bg-green-500 text-white px-3 py-1 rounded w-full"
            >
              Ready
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}