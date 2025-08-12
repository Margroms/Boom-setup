import OrderList from './components/OrderList';

export default function KitchenDashboardPage() {
  // You would get the outletId from the authenticated user's session
  const outletId = 'outlet-main-kitchen'; // Example Outlet ID

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Kitchen Dashboard</h1>
      <OrderList outletId={outletId} />
    </div>
  );
}