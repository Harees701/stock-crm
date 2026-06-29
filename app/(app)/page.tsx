import Link from "next/link";
import { all, get } from "@/lib/db";
import { PageHeader, Card, Stat } from "@/app/ui";
import { money, dateOnly } from "@/lib/format";

export const dynamic = "force-dynamic";

type Totals = {
  products: number;
  units: number;
  stock_value: number;
  low_stock: number;
};

type LowStock = {
  id: number;
  name: string;
  quantity: number;
  reorder_level: number;
};

type RecentOrder = {
  id: number;
  total: number;
  created_at: string;
  customer_name: string | null;
};

export default function Dashboard() {
  const totals = get<Totals>(`
    SELECT
      COUNT(*)                          AS products,
      COALESCE(SUM(quantity), 0)        AS units,
      COALESCE(SUM(quantity * price),0) AS stock_value,
      COALESCE(SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END), 0) AS low_stock
    FROM products
  `)!;

  const sales = get<{ orders: number; revenue: number }>(`
    SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders
  `)!;

  const lowStock = all<LowStock>(`
    SELECT id, name, quantity, reorder_level
    FROM products
    WHERE quantity <= reorder_level
    ORDER BY quantity ASC
  `);

  const recent = all<RecentOrder>(`
    SELECT o.id, o.total, o.created_at, c.name AS customer_name
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    ORDER BY o.id DESC
    LIMIT 5
  `);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your stock and sales"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Products" value={String(totals.products)} />
        <Stat label="Units in stock" value={String(totals.units)} />
        <Stat label="Stock value" value={money(totals.stock_value)} />
        <Stat label="Total sales" value={money(sales.revenue)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={`Low stock (${lowStock.length})`}>
          {lowStock.length === 0 ? (
            <p className="text-sm text-zinc-500">Everything is well stocked. 🎉</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {p.quantity} left (reorder at {p.reorder_level})
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/products"
            className="mt-4 inline-block text-sm text-zinc-600 hover:underline"
          >
            Manage products →
          </Link>
        </Card>

        <Card title="Recent orders">
          {recent.length === 0 ? (
            <p className="text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">
                      {o.customer_name ?? "Walk-in"}
                    </span>
                    <span className="ml-2 text-zinc-400">
                      {dateOnly(o.created_at)}
                    </span>
                  </span>
                  <span className="font-medium">{money(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/orders"
            className="mt-4 inline-block text-sm text-zinc-600 hover:underline"
          >
            View all orders →
          </Link>
        </Card>
      </div>
    </div>
  );
}
