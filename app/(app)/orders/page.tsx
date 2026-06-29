import { all, type Customer } from "@/lib/db";
import { createOrder, deleteOrder } from "@/lib/actions";
import { PageHeader, Card, SubmitButton, labelClass, inputClass } from "@/app/ui";
import { money, dateOnly } from "@/lib/format";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: number;
  total: number;
  status: string;
  created_at: string;
  customer_name: string | null;
  items: string | null;
};

type ProductOption = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const orders = all<OrderRow>(`
    SELECT o.id, o.total, o.status, o.created_at,
           c.name AS customer_name,
           (SELECT group_concat(p.name || ' x' || oi.quantity, ', ')
              FROM order_items oi
              LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = o.id) AS items
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    ORDER BY o.id DESC
  `);

  const customers = all<Customer>("SELECT * FROM customers ORDER BY name");
  const products = all<ProductOption>(
    "SELECT id, name, price, quantity FROM products WHERE quantity > 0 ORDER BY name"
  );

  return (
    <div>
      <PageHeader title="Orders" subtitle="Sales that draw down your stock" />

      {error === "out-of-stock" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          That product is out of stock.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-100">
                    <td className="py-2 text-zinc-500">{o.id}</td>
                    <td className="py-2 text-zinc-600">{dateOnly(o.created_at)}</td>
                    <td className="py-2 font-medium">{o.customer_name ?? "Walk-in"}</td>
                    <td className="py-2 text-zinc-600">{o.items ?? "—"}</td>
                    <td className="py-2 font-medium">{money(o.total)}</td>
                    <td className="py-2 text-right">
                      <form action={deleteOrder}>
                        <input type="hidden" name="id" value={o.id} />
                        <button
                          className="text-xs text-red-600 hover:underline"
                          title="Cancel order and restock items"
                        >
                          Cancel
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-400">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="New order">
          {products.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No products in stock to sell.
            </p>
          ) : (
            <form action={createOrder} className="flex flex-col gap-3">
              <label className="block">
                <span className={labelClass}>Customer</span>
                <select name="customer_id" className={inputClass} defaultValue="">
                  <option value="">Walk-in</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Product</span>
                <select name="product_id" className={inputClass} required>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {money(p.price)} ({p.quantity} in stock)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Quantity</span>
                <input
                  className={inputClass}
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                />
              </label>
              <SubmitButton>Create order</SubmitButton>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
