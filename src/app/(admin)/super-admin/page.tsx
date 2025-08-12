import Analytics from './components/Analytics';
import BrandManager from './components/BrandManager';

// This function would fetch data directly from Postgres via Prisma
async function getAdminData() {
  // const dailySales = await prisma.sales_daily.findMany(...);
  // const brands = await prisma.brand.findMany(...);
  return {
    dailySales: [
      { date: '2024-08-10', net: 45000 },
      { date: '2024-08-11', net: 52000 },
    ],
    brands: [
      { id: 'brand1', name: 'Burger Queen' },
      { id: 'brand2', name: 'Pizza King' },
    ]
  };
}


export default async function SuperAdminPage() {
  // Fetch data on the server. This aligns with the "Durable Ledger & Analytics" model.
  const { dailySales, brands } = await getAdminData();

  return (
    <div className="p-6">
      <h1 className="text-4xl font-extrabold mb-6">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-3">Sales Analytics</h2>
          <Analytics initialData={dailySales} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-3">Brand Management</h2>
          <BrandManager initialBrands={brands} />
        </div>
      </div>
    </div>
  );
}