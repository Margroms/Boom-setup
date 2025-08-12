'use client';

// This component receives its data as props.
// It could be enhanced with client-side filtering or charting libraries.
export default function Analytics({ initialData }: { initialData: any[] }) {
  return (
    <div>
      <p className="mb-2">Daily Net Sales (from Postgres):</p>
      <ul>
        {initialData.map(d => (
          <li key={d.date}>{d.date}: <strong>₹{d.net.toLocaleString()}</strong></li>
        ))}
      </ul>
    </div>
  );
}