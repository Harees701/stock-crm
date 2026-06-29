"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { all, get, run, tx, type Product } from "@/lib/db";
import {
  requireUser,
  hashPassword,
  verifyPassword,
  userCount,
  createSession,
  destroySession,
} from "@/lib/auth";

// ---- Helpers -----------------------------------------------------------------
function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function optStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v === "" ? null : v;
}
function num(formData: FormData, key: string): number {
  const n = Number(formData.get(key));
  return Number.isFinite(n) ? n : 0;
}
function optId(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---- Suppliers ---------------------------------------------------------------
export async function createSupplier(formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;
  run(
    "INSERT INTO suppliers (name, email, phone) VALUES (?, ?, ?)",
    name,
    optStr(formData, "email"),
    optStr(formData, "phone")
  );
  revalidatePath("/suppliers");
}

export async function deleteSupplier(formData: FormData) {
  await requireUser();
  run("DELETE FROM suppliers WHERE id = ?", num(formData, "id"));
  revalidatePath("/suppliers");
  revalidatePath("/products");
}

// ---- Customers ---------------------------------------------------------------
export async function createCustomer(formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;
  run(
    "INSERT INTO customers (name, email, phone, company) VALUES (?, ?, ?, ?)",
    name,
    optStr(formData, "email"),
    optStr(formData, "phone"),
    optStr(formData, "company")
  );
  revalidatePath("/customers");
}

export async function deleteCustomer(formData: FormData) {
  await requireUser();
  run("DELETE FROM customers WHERE id = ?", num(formData, "id"));
  revalidatePath("/customers");
}

// ---- Products ----------------------------------------------------------------
export async function createProduct(formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;
  run(
    `INSERT INTO products (name, sku, description, quantity, price, reorder_level, supplier_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    name,
    optStr(formData, "sku"),
    optStr(formData, "description"),
    num(formData, "quantity"),
    num(formData, "price"),
    num(formData, "reorder_level"),
    optId(formData, "supplier_id")
  );
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deleteProduct(formData: FormData) {
  await requireUser();
  run("DELETE FROM products WHERE id = ?", num(formData, "id"));
  revalidatePath("/products");
  revalidatePath("/");
}

// Quick stock adjustment (+/-) from the products page.
export async function adjustStock(formData: FormData) {
  await requireUser();
  const id = num(formData, "id");
  const delta = num(formData, "delta");
  run(
    "UPDATE products SET quantity = MAX(0, quantity + ?) WHERE id = ?",
    delta,
    id
  );
  revalidatePath("/products");
  revalidatePath("/");
}

// ---- Orders ------------------------------------------------------------------
export async function createOrder(formData: FormData) {
  await requireUser();
  const customerId = optId(formData, "customer_id");
  const productId = num(formData, "product_id");
  const quantity = Math.max(1, num(formData, "quantity"));

  const product = get<Product>("SELECT * FROM products WHERE id = ?", productId);
  if (!product) return;

  // Don't allow selling more than we have in stock.
  const qty = Math.min(quantity, product.quantity);
  if (qty <= 0) {
    redirect("/orders?error=out-of-stock");
  }

  const total = qty * product.price;

  tx(() => {
    const order = run(
      "INSERT INTO orders (customer_id, status, total) VALUES (?, 'completed', ?)",
      customerId,
      total
    );
    const orderId = Number(order.lastInsertRowid);
    run(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      orderId,
      productId,
      qty,
      product.price
    );
    run("UPDATE products SET quantity = quantity - ? WHERE id = ?", qty, productId);
  });

  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/orders");
}

export async function deleteOrder(formData: FormData) {
  await requireUser();
  const id = num(formData, "id");
  // Restock items before removing the order.
  const items = all<{ product_id: number | null; quantity: number }>(
    "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
    id
  );
  tx(() => {
    for (const item of items) {
      if (item.product_id != null) {
        run(
          "UPDATE products SET quantity = quantity + ? WHERE id = ?",
          item.quantity,
          item.product_id
        );
      }
    }
    run("DELETE FROM orders WHERE id = ?", id);
  });
  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/");
}

// ---- Auth --------------------------------------------------------------------
export async function login(formData: FormData) {
  const username = str(formData, "username");
  const password = String(formData.get("password") ?? "");
  const user = get<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE username = ?",
    username
  );
  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect("/login?error=invalid");
  }
  await createSession(user.id);
  redirect("/");
}

// First-run account creation. Only allowed while there are no users yet.
export async function register(formData: FormData) {
  if (userCount() > 0) redirect("/login");

  const username = str(formData, "username");
  const password = String(formData.get("password") ?? "");
  if (username.length < 3 || password.length < 6) {
    redirect("/login?error=weak");
  }

  const result = run(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    username,
    hashPassword(password)
  );
  await createSession(Number(result.lastInsertRowid));
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
