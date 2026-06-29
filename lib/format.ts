const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function money(value: number): string {
  return gbp.format(value || 0);
}

export function dateOnly(value: string): string {
  // SQLite datetime('now') gives "YYYY-MM-DD HH:MM:SS"
  return value?.slice(0, 10) ?? "";
}
