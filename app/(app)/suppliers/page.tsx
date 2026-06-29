import { all, type Supplier } from "@/lib/db";
import { createSupplier, deleteSupplier } from "@/lib/actions";
import { PageHeader, Card, Field, SubmitButton } from "@/app/ui";

export const dynamic = "force-dynamic";

export default function SuppliersPage() {
  const suppliers = all<Supplier>("SELECT * FROM suppliers ORDER BY name");

  return (
    <div>
      <PageHeader title="Suppliers" subtitle="Companies you buy stock from" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-100">
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2 text-zinc-600">{s.email ?? "—"}</td>
                    <td className="py-2 text-zinc-600">{s.phone ?? "—"}</td>
                    <td className="py-2 text-right">
                      <form action={deleteSupplier}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="text-xs text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      No suppliers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Add supplier">
          <form action={createSupplier} className="flex flex-col gap-3">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" />
            <SubmitButton>Add supplier</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
