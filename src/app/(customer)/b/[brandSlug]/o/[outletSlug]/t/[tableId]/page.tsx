import Menu from './components/Menu';
import Cart from './components/Cart';

interface CustomerPageProps {
  params: {
    brandSlug: string;
    outletSlug: string;
    tableId: string;
  };
}

// This page will be rendered on the server.
// It can fetch initial, non-real-time data here.
export default async function CustomerPage({ params }: CustomerPageProps) {
  // The design mentions a prerendered menu skeleton.
  // We can fetch the initial static catalog from Postgres here.
  // const initialMenu = await getMenuFromPostgres(params.outletSlug);

  return (
    <div className="container mx-auto grid grid-cols-3 gap-8 p-4">
      <div className="col-span-2">
        <h1 className="text-3xl font-bold mb-4">Welcome to {params.brandSlug}</h1>
        {/* Menu component will handle real-time inventory updates */}
        <Menu outletId={params.outletSlug} />
      </div>
      <div>
        {/* Cart component is fully client-side for real-time interaction */}
        <Cart sessionKey={`table_${params.tableId}`} />
      </div>
    </div>
  );
}