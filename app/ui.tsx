import React from "react";

export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

export const labelClass = "block text-xs font-medium text-zinc-600 mb-1";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="text-sm text-zinc-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      {title ? (
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  step,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string | number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        className={inputClass}
        name={name}
        type={type}
        required={required}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
    >
      {children}
    </button>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
