# Deploying Stock CRM to Railway

This app stores data in a single SQLite file (`node:sqlite`). To keep that data
between deploys it must live on a **persistent volume**, which Railway provides.

## One-time setup

### 1. Create a Railway account

- Go to <https://railway.com> and **Sign up with GitHub** (free trial; ~$5/mo
  after the trial credit runs out).
- Authorise Railway to access your GitHub account.

### 2. Create the project from this repo

- Click **New Project** → **Deploy from GitHub repo**.
- Pick **`Harees701/stock-crm`**.
- Railway auto-detects Next.js and starts the first build. (It will run
  `npm install`, `npm run build`, then `npm start`.)

### 3. Add a persistent volume (IMPORTANT — do this before relying on data)

- In your service, open the **Variables**/**Settings** area and click
  **+ Volume** (or **New Volume**).
- Set the **Mount path** to:  `/data`

### 4. Set the database path environment variable

- In the service **Variables** tab, add:

  | Variable      | Value                  |
  | ------------- | ---------------------- |
  | `SQLITE_PATH` | `/data/stock-crm.db`   |

  This tells the app to store the database on the mounted volume instead of the
  ephemeral container disk. (Railway sets `PORT` automatically — no action needed.)

### 5. Generate a public URL

- In **Settings → Networking**, click **Generate Domain**.
- Open the URL. On first visit you'll see **"Create your admin account"** —
  set your username and password.

## Redeploying

Every `git push` to `main` triggers a new Railway deploy automatically. Your
data on the volume (`/data/stock-crm.db`) survives deploys.

## Notes

- The app seeds a few sample products/suppliers/customers on first run with an
  empty database. Delete them from the UI once you add your own.
- Node 24 is required (for stable `node:sqlite`); this is pinned via
  `package.json` `engines` and `.nvmrc`.
- To wipe and start fresh, delete the volume (this deletes all data) and
  redeploy.
