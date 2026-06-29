// Local database layer for the Stock CRM.
// Uses Node's built-in SQLite (node:sqlite) — no external database, no native
// build step. The whole database lives in a single file: stock-crm.db
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

// ---- Row types ---------------------------------------------------------------
export type Supplier = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  quantity: number;
  price: number;
  reorder_level: number;
  supplier_id: number | null;
  created_at: string;
};

export type Order = {
  id: number;
  customer_id: number | null;
  status: string;
  total: number;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  quantity: number;
  unit_price: number;
};

// ---- Connection (singleton across hot reloads) -------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __stockCrmDb: DatabaseSync | undefined;
}

function createDb(): DatabaseSync {
  const file = path.join(process.cwd(), "stock-crm.db");
  const database = new DatabaseSync(file);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  migrate(database);
  seed(database);
  return database;
}

function migrate(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT,
      phone      TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT,
      phone      TEXT,
      company    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      sku           TEXT UNIQUE,
      description   TEXT,
      quantity      INTEGER NOT NULL DEFAULT 0,
      price         REAL NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 5,
      supplier_id   INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      total       REAL NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      quantity   INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seed(database: DatabaseSync) {
  const row = database.prepare("SELECT COUNT(*) AS n FROM products").get() as {
    n: number;
  };
  if (row.n > 0) return; // already seeded

  const supplier = database.prepare(
    "INSERT INTO suppliers (name, email, phone) VALUES (?, ?, ?)"
  );
  const garrett = supplier.run("Garrett Motion", "sales@garrett.example", "0161 555 0101");
  const bilstein = supplier.run("Bilstein UK", "trade@bilstein.example", "0161 555 0202");

  const customer = database.prepare(
    "INSERT INTO customers (name, email, phone, company) VALUES (?, ?, ?, ?)"
  );
  customer.run("James Wright", "james@example.com", "07700 900111", "Wright Motorsport");
  customer.run("Aisha Khan", "aisha@example.com", "07700 900222", null);

  const product = database.prepare(
    `INSERT INTO products (name, sku, description, quantity, price, reorder_level, supplier_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  product.run("Turbo Kit GTX2867R", "TRB-2867", "Bolt-on turbo upgrade kit", 8, 1899.99, 3, Number(garrett.lastInsertRowid));
  product.run("Coilover Set B16", "COL-B16", "Adjustable coilover suspension set", 12, 1099.0, 4, Number(bilstein.lastInsertRowid));
  product.run("Cat-Back Exhaust", "EXH-CB1", "Stainless steel cat-back exhaust", 5, 749.5, 5, null);
  product.run("Performance Brake Pads", "BRK-PAD1", "Front high-performance pad set", 2, 129.99, 6, null);
  product.run("Cold Air Intake", "INT-CAI1", "High-flow cold air intake kit", 20, 189.0, 8, null);
}

const db: DatabaseSync = globalThis.__stockCrmDb ?? (globalThis.__stockCrmDb = createDb());

// ---- Tiny typed query helpers ------------------------------------------------
type Param = string | number | bigint | null;

export function all<T>(sql: string, ...params: Param[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function get<T>(sql: string, ...params: Param[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function run(sql: string, ...params: Param[]) {
  return db.prepare(sql).run(...params);
}

export function tx(fn: () => void) {
  db.exec("BEGIN");
  try {
    fn();
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export default db;
