import { all, type Customer } from "@/lib/db";
import { createCustomer, deleteCustomer } from "@/lib/actions";
import { PageHeader, Card, Field, SubmitButton } from "@/app/ui";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  const customers = all<Customer>("SELECT * FROM customers ORDER BY name");

  return (
    <div>
      <PageHeader title="Customers" subtitle="People and companies you sell to" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2 text-zinc-600">{c.company ?? "—"}</td>
                    <td className="py-2 text-zinc-600">{c.email ?? "—"}</td>
                    <td className="py-2 text-zinc-600">{c.phone ?? "—"}</td>
                    <td className="py-2 text-right">
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-xs text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400">
                      No customers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <Card title="Add customer">
          <form action={createCustomer} className="flex flex-col gap-3">
            <Field label="Name" name="name" required />
            <Field label="Company" name="company" />
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" />
            <SubmitButton>Add customer</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
