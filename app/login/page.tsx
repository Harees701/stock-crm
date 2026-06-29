import { redirect } from "next/navigation";
import { getCurrentUser, userCount } from "@/lib/auth";
import { login, register } from "@/lib/actions";
import { inputClass, labelClass } from "@/app/ui";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  invalid: "Incorrect username or password.",
  weak: "Username must be 3+ characters and password 6+ characters.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already signed in? Go to the app.
  if (await getCurrentUser()) redirect("/");

  const { error } = await searchParams;
  const firstRun = userCount() === 0;
  const action = firstRun ? register : login;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">Stock CRM</h1>
          <p className="text-sm text-zinc-500">
            {firstRun ? "Create your admin account" : "Sign in to continue"}
          </p>
        </div>

        {error && messages[error] && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {messages[error]}
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          <label className="block">
            <span className={labelClass}>Username</span>
            <input className={inputClass} name="username" required autoFocus />
          </label>
          <label className="block">
            <span className={labelClass}>Password</span>
            <input
              className={inputClass}
              name="password"
              type="password"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            {firstRun ? "Create account" : "Sign in"}
          </button>
        </form>

        {firstRun && (
          <p className="mt-4 text-center text-xs text-zinc-400">
            This is the first run, so this account becomes the administrator.
          </p>
        )}
      </div>
    </div>
  );
}
