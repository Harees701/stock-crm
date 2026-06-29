import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/suppliers", label: "Suppliers" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate every page in this group. Redirects to /login if not signed in.
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white px-4 py-6">
        <div className="px-2 pb-6">
          <div className="text-lg font-bold tracking-tight">Stock CRM</div>
          <div className="text-xs text-zinc-500">DKU Performance</div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-zinc-200 pt-4">
          <div className="px-2 pb-2 text-xs text-zinc-500">
            Signed in as{" "}
            <span className="font-medium text-zinc-700">{user.username}</span>
          </div>
          <form action={logout}>
            <button className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
