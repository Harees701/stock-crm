# Stock CRM

A simple inventory + customer management app for **DKU Performance**.
Track stock, suppliers, customers, and sales orders that automatically draw
down your stock.

## Tech

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **SQLite** via Node's built-in `node:sqlite` — the whole database is one file
  (`stock-crm.db`), no separate database server, no Docker.

## Running it

```bash
npm install      # first time only
npm run dev      # start the dev server
```

Then open <http://localhost:3000> (during setup it was run on port 3939).

The database file `stock-crm.db` is created automatically on first run and
seeded with a few sample products, suppliers, and customers. To start fresh,
stop the server, delete `stock-crm.db*`, and start again.

## Where things live

| Path                | What it is                                            |
| ------------------- | ----------------------------------------------------- |
| `lib/db.ts`         | Database connection, table schema, and seed data      |
| `lib/actions.ts`    | Server Actions (create/update/delete, create order)   |
| `lib/format.ts`     | Currency (£) and date formatting helpers              |
| `app/page.tsx`      | Dashboard (totals, low-stock alerts, recent orders)   |
| `app/products/`     | Products list + add form + quick stock +/- controls   |
| `app/orders/`       | Orders list + new-order form (decrements stock)       |
| `app/customers/`    | Customers list + add form                             |
| `app/suppliers/`    | Suppliers list + add form                             |
| `app/ui.tsx`        | Small shared UI components                             |

## Features

- **Dashboard** — product count, units in stock, total stock value, total sales,
  low-stock list, recent orders.
- **Products** — add products with SKU, price, quantity, reorder level, and
  supplier. Rows turn red when stock is at or below the reorder level. Adjust
  stock with the +/- buttons.
- **Orders** — create a sale by picking a customer, product, and quantity. Stock
  is decremented in a transaction; cancelling an order restocks it.
- **Customers / Suppliers** — basic contact management.

## Ideas for next

- Multi-line orders (more than one product per order)
- Edit (not just add/delete) for each record
- Purchase orders / restocking from suppliers
- Search and pagination
- User login
