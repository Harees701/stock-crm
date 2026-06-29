import { all, type Supplier } from "@/lib/db";
import {
  createProduct,
  deleteProduct,
  adjustStock,
} from "@/lib/actions";
import { PageHeader, Card, Field, SubmitButton, labelClass, inputClass } from "@/app/ui";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  price: number;
  reorder_level: number;
  supplier_name: string | null;
};

export default function ProductsPage() {
  const products = all<ProductRow>(`
    SELECT p.id, p.name, p.sku, p.quantity, p.price, p.reorder_level,
           s.name AS supplier_name
    FROM products p
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    ORDER BY p.name
  `);
  const suppliers = all<Supplier>("SELECT * FROM suppliers ORDER BY name");

  return (
    <div>
      <PageHeader title="Products" subtitle="Your stock items" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Supplier</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const low = p.quantity <= p.reorder_level;
                  return (
                    <tr key={p.id} className="border-b border-zinc-100">
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2 font-mono text-xs text-zinc-500">
                        {p.sku ?? "—"}
                      </td>
                      <td className="py-2 text-zinc-600">
                        {p.supplier_name ?? "—"}
                      </td>
                      <td className="py-2 text-zinc-600">{money(p.price)}</td>
                      <td className="py-2">
                        <span
                          className={
                            low
                              ? "inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                              : "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                          }
                          title={`Reorder at ${p.reorder_level}`}
                        >
                          {p.quantity}
                          {low ? " · low" : ""}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-end gap-1">
                          <form action={adjustStock}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="delta" value="-1" />
                            <button className="h-6 w-6 rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100">
                              −
                            </button>
                          </form>
                          <form action={adjustStock}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="delta" value="1" />
                            <button className="h-6 w-6 rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100">
                              +
                            </button>
                          </form>
                          <form action={deleteProduct}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="ml-2 text-xs text-red-600 hover:underline">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-400">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Add product">
          <form action={createProduct} className="flex flex-col gap-3">
            <Field label="Name" name="name" required />
            <Field label="SKU" name="sku" placeholder="e.g. TRB-2867" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity" name="quantity" type="number" defaultValue={0} />
              <Field label="Price (£)" name="price" type="number" step="0.01" defaultValue={0} />
            </div>
            <Field
              label="Reorder level"
              name="reorder_level"
              type="number"
              defaultValue={5}
            />
            <label className="block">
              <span className={labelClass}>Supplier</span>
              <select name="supplier_id" className={inputClass} defaultValue="">
                <option value="">— none —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton>Add product</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
