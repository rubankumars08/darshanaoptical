# Darshana Optical — User Manual

*Clear, step-by-step instructions for using the website and the shop management panel.*

**System:** Darshana Optical · Harur, Tamil Nadu · ☎ 88705 71536
**Website:** https://darshanaoptical.com · **Admin panel:** https://darshanaoptical.com/admin/login

---

## Contents

1. [What this system does](#1-what-this-system-does)
2. [Who can do what — roles](#2-who-can-do-what--roles)
3. [Part A — For visitors (public website)](#3-part-a--for-visitors-public-website)
4. [Part B — Signing in to the Admin Panel](#4-part-b--signing-in-to-the-admin-panel)
5. [Part C — Daily counter work (all roles)](#5-part-c--daily-counter-work-all-roles)
6. [Part D — Shop management (manager & admin)](#6-part-d--shop-management-manager--admin)
7. [Part E — Administrator only](#7-part-e--administrator-only)
8. [First-time setup & deployment](#8-first-time-setup--deployment)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)
10. [Golden rules](#10-golden-rules)

---

## 1. What this system does

| Part | Who uses it | What it does |
|---|---|---|
| **Public website** | Customers | Shows the shop, frames, lenses, offers; lets anyone **book an eye test** or **send an inquiry** |
| **Admin panel** | Shop staff | Runs the whole shop: customers, eye tests, billing (POS), orders, stock, purchases, expenses, reports |

The two are connected: a booking made on the website appears instantly in the admin panel under **Website Bookings**, and both the shop owner and the customer receive an email automatically.

---

## 2. Who can do what — roles

| Feature | Staff | Manager | Admin |
|---|---|---|---|
| Dashboard, Billing/POS, Website Bookings, Customers, Eye Tests, Orders, Pending Payments, Products & Stock, Stock In/Out | ✅ | ✅ | ✅ |
| Purchases & Suppliers, Expenses, Daily Reports, Audit Log | — | ✅ | ✅ |
| Staff Team, Shop Settings | — | — | ✅ |
| Delete a customer or product | — | — | ✅ |
| Maximum discount at billing | 5 % | 15 % | 100 % |

> These discount ceilings are configurable by the Admin in **Shop Settings**. Billing is always re-checked on the server, so the UI can never talk it into a bigger discount.


---

## 3. Part A — For visitors (public website)

### 3.1 Browse the shop
Open the website. From the menu you can explore **Frames**, **Lenses**, **Progressive Lenses**, **Eye Testing**, **Offers**, **Gallery**, and use **Lens Finder / Frame Finder** guides. A floating **WhatsApp button** chats with the shop directly.

### 3.2 Book an eye test (no login needed)
1. Click **Book Eye Test** (or open `/book-eye-test`).
2. Fill in: **Name**, **Phone** (must be a valid number — 7 to 15 digits, may start with `+` and may contain spaces or hyphens), optional email, preferred **date & time**, whether you currently wear glasses, and any notes.
3. Press **Submit**.
4. You will see a success message. The shop receives an alert email, and if you gave an email address you receive a confirmation too.
   - Maximum 5 bookings per 10 minutes from one connection — if you see *"Too many requests"*, wait a little or call the shop.

### 3.3 Contact the shop
Open **Contact**, fill in name, phone, what you're interested in, and your message. The shop is notified by email and will call you back.

---

## 4. Part B — Signing in to the Admin Panel

1. Go to **/admin** (e.g. `darshanaoptical.com/admin`). Anyone not signed in is automatically taken to the sign-in page.
2. Enter your **email** and **password** (accounts are created by the Administrator — see Part E).
3. Click **Sign In**. You land on the **Dashboard**.
4. Click **Logout** at the bottom of the left sidebar when finished — especially on shared computers.

**Good to know:**
- After **8 wrong passwords within 15 minutes**, that email (and the computer's IP) is locked out for **15 minutes**. This is intentional protection — wait, or ask the admin.
- Sessions last 7 days, but changing a password or deactivating a user cuts their sessions off immediately.
- Sessions survive closing the browser; use Logout to end them early.

---

## 5. Part C — Daily counter work (all roles)

### 5.1 Dashboard (`/admin/dashboard`)
Your morning overview: **today's sales & invoices**, **money collected today**, **new customers today**, **this month's sales**, plus **pending orders**, **low-stock alerts**, **recent invoices**, and **today's website bookings**. Use the ↻ button to refresh.

### 5.2 Billing / POS — the main daily screen
Creates an invoice and, optionally, an order for lens fitting. Four steps:

> The **Express Counter** button in the top bar leads here too (the old `/admin/counter` page now redirects to POS, so old bookmarks keep working).

**Step 1 — Customer**
- Search by name, phone, or customer ID (e.g. `DO-2026-041`) → click the customer.
- New customer? Click **+ New Customer**, fill the form, save — you return to billing with them selected.
- If the customer has earlier eye tests, you can pick one to link to the invoice (it prints on the job card).

**Step 2 — Products**
- The cart shows on the right. Filter tabs: All / Frames / Lenses / Sunglasses / Service.
- Click a product to add it; adjust **quantity** or remove ✕. Only in-stock items are listed.
- Apply a **discount %** — you will get an error if it exceeds your role's ceiling (staff 5 %, manager 15 %, admin 100 %).

**Step 3 — Payment**
- Choose **Cash / UPI / Card / Bank**, enter **Amount Paid** (may be an advance; the rest becomes balance), optionally mark **this bill includes an order** and set the **expected date** (default +3 days) plus frame/lens description.

**Step 4 — Done**
- The invoice is created with number `DO-YYYY-#####`. Use **View Invoices** to see it, open it, and **print**. Stock is reduced automatically and the payment is recorded.

### 5.3 Customers (`/admin/customers`)
- Search by name/phone/ID; click a row for the full profile: contact details, **eye-test history**, invoices, notes, last visit.
- **+ Add Customer** (`/admin/customers/new`): name and phone are required; email, DOB, gender, address, notes optional. The customer ID is generated automatically.
- Edit with **Edit**; only an **Admin** can delete.

### 5.4 Eye Tests (`/admin/eye-tests`)
- **+ New Eye Test** (`/admin/eye-tests/new`): choose the customer, date, tester name, then enter the prescription for **Right Eye** and **Left Eye**: SPH, CYL, Axis, ADD (for progressives), PD, plus visual acuity and recommendation.
- Save — it stays attached to the customer forever and can be picked during billing.
- **Printable prescription:** in the Eye Tests list, the **Prescription** button opens a clean print-ready prescription sheet for the customer (`/admin/prescriptions/…`).

### 5.5 Orders & Fitting (`/admin/orders`)
Every invoice that included an order appears here. Move each one along the pipeline with the status dropdown:
**New → Lens Ordered → In Process → Ready → Delivered** (or Cancelled).
Call the customer from the phone icon when the order is **Ready**.

### 5.6 Pending Payments (`/admin/payments`)
All invoices with an outstanding **balance**. Open an invoice to **record a payment** (choose method); the balance and status update automatically (Paid / Part Paid / Pending).

### 5.7 Invoices (`/admin/invoices`)
The full invoice register (reached via **View Invoices** after a sale, or from any invoice link):
- Top cards: **Total Value, Received, Pending** for the filtered list.
- Search by invoice number or customer; filter by status (Paid / Part Paid / Pending / Cancelled).
- Click a row to open the **invoice detail**: line items, payment history, **+ Add Payment** (amount, method, notes), **print**, and order-status updates. This is the same screen you land on from *Pending Payments*.

### 5.8 Products & Stock (`/admin/products`)
- Tabs for **Frames / Lenses / Sunglasses**. Search by name, brand, or code.
- **+ Add Product**: name, brand, model, category, colour, size, material, **purchase price, selling price, MRP**, opening stock, low-stock threshold, description, and optional **photo** (uploaded to cloud storage).
- **Edit** to change prices/details; **Admin** can delete. Inactive products stop appearing at billing.

### 5.9 Stock In / Out (`/admin/inventory`)
- **Stock In**: pick a product, quantity, reason (purchase/damage-return/adjustment), optional reference — stock increases and a movement is recorded.
- The **Stock Movements** ledger shows every in/out with who did it and when — the audit trail for physical stock. Negative quantities = out (sale, damage, return).

---

## 6. Part D — Shop management (manager & admin)

### 6.1 Purchases & Suppliers (`/admin/purchases`)
When stock arrives from a supplier:
1. Click **+ New Purchase**. Choose the **supplier** and enter their **bill number**.
2. Add each item (product, quantity, purchase price) — totals calculate automatically.
3. Enter how much you **paid now** (the rest becomes the supplier **balance** — money you owe them).
4. Save. Stock increases for every item automatically and a stock movement is recorded.
   - The balance can only be changed by recording payments against purchases — it is server-owned.

### 6.2 Suppliers (`/admin/suppliers`)
Add/edit suppliers: name, contact person, phone, email, address, **GST number**. The **Balance** column shows what you currently owe each supplier.

### 6.3 Expenses (`/admin/expenses`)
- **+ Add Expense**: date, category (**rent, electricity, salary, transport, maintenance, marketing, supplies, other**), amount, payment method, description, optional reference/bill number.
- Filter by month; totals shown at the top. These feed straight into **Daily Reports**.

### 6.4 Daily Reports (`/admin/reports`)
Pick a month (last 6 available): **Total Sales, Amount Collected, Total Expenses, Net Profit** (collected − expenses), plus an **expense breakdown by category** and the invoice list for that month. Cancelled invoices are excluded automatically.

### 6.5 Website Bookings (`/admin/bookings`)
Every eye-test booking from the website and every contact inquiry, newest first, with status filters.
- **Appointments:** set status to **Confirmed** once you've called the customer, **Completed** after the test, or **Cancelled**.
- **Inquiries:** mark **Contacted** once handled, then **Closed**.
- Use the phone/mail icons to contact the person directly.

---

## 7. Part E — Administrator only

### 7.1 Staff Team (`/admin/staff`)
- **+ Add Staff**: name, email, phone, **role** (staff/manager/admin), password. Share the password privately.
- **Edit** a user to change role/details, **reset their password**, or set status **Inactive** (instantly blocks their sign-in and existing sessions).
- Safety rails: you cannot deactivate or demote **yourself**, and you cannot remove/demote the **last active admin**.

### 7.2 Shop Settings (`/admin/settings`)
- **Shop profile:** name, tagline, phone, WhatsApp, email, address — used on invoices.
- **Document numbering:** invoice prefix and customer prefix (default `DO`).
- **Tax:** enable/disable and set rate. **Low-stock threshold** (default 5).
- **Discount ceilings per role:** admin / manager / staff percentages.
- **Invoice footer & terms** text.
- Only the **Admin** sees and can change this page; every change is written to the audit log.

### 7.3 Audit Log (`/admin/audit`)
A read-only trail of who did what, when: logins, invoice creation, product/price changes, settings changes, staff changes — with the performer's name and role. Use the filters to investigate a specific entity or date.

---

## 8. First-time setup & deployment

### 8.1 Requirements
Node.js 20+, a **TiDB Cloud / MySQL** database, a **Gmail account with an App Password** (for emails), and optionally a **Cloudflare R2 bucket** (for product photos).

### 8.2 Steps
```bash
npm install                   # 1. install dependencies
cp .env.example .env.local    # 2. create the environment file, then edit it (see below)
node db/migrate.mjs           # 3. create all tables + seed users (FIRST TIME ONLY)
node db/migrate_security.mjs  # 4. idempotent security migration (safe to re-run)
npm run dev                   # 5. development server at http://localhost:3000
npm run build && npm start    # production mode
```

> **Updating an older existing database?** Two extra one-off scripts exist:
> `node db/migrate_public_forms.mjs` adds the `appointments` and `inquiries` tables (needed for website bookings/inquiries), and `node db/add_image_column.mjs` adds the product photo column. Both are safe to re-run — on a fresh database, step 3 already includes them.

### 8.3 Environment variables (`.env.local`)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | TiDB/MySQL connection string (`mysql://user:pass@host:4000/dbname`) |
| `SESSION_SECRET` | Random 32+ hex chars — signs admin session cookies. **Keep secret.** |
| `ADMIN_API_SECRET` | Random 32+ hex chars — protects the two public GET counters |
| `SMTP_FROM` / `SMTP_PASS` | Gmail address + 16-char App Password (myaccount.google.com → Security → App Passwords) |
| `R2_*` (5 values) | Cloudflare R2 bucket + public URL for product images |
| `SEED_ADMIN_PASSWORD` etc. | Optional: set before the very first `db/migrate.mjs` run to choose initial passwords; otherwise random ones are printed once |

> `db/migrate.mjs` prints each seeded user's email and password exactly once — copy them immediately. Default seeded accounts: `admin@darshana.com`, `manager@darshana.com`, `staff@darshana.com`.

### 8.4 Deploying updates
```bash
npm test          # everything must pass
npm run build     # must compile
npm start         # (or deploy to your host; keep env vars set on the host)
```
If `db/schema.sql` changed, check `db/` for a new migration script and run it — they are all idempotent.

---

## 9. Troubleshooting & FAQ

| Problem | Cause & fix |
|---|---|
| **"Too many requests" on the booking form** | The 5-per-10-minutes limit was hit. Wait 10 minutes or call the shop. |
| **"a valid phone number is required" when booking** | The phone field needs 7–15 digits (e.g. `9876543210` or `+91 98765 43210`). Letters and symbols like `(` `)` are not accepted. |
| **"Invalid email or password" but I'm sure it's right** | After 8 failures you're locked 15 minutes. Wait, or have an admin verify the account is **Active**. |
| **Redirected to login even after signing in** | Your session was revoked (password/role changed) — sign in again. |
| **"Discount exceeds the limit for your role"** | Intentional. Ask a manager/admin to apply the larger discount. |
| **Product missing in POS** | Stock is 0 or status inactive — restock via **Stock In** or fix in **Products**. |
| **Emails not arriving** | Check `SMTP_FROM`/`SMTP_PASS` in `.env.local`; the Gmail App Password must be current (16 chars). The booking still saves even if email fails. |
| **Invoice number looks skipped** | Numbers come from a collision-safe counter; cancelled invoices still consume a number. Normal. |
| **Product photo won't upload** | Only images (JPG/PNG/WebP) are allowed — SVG is rejected for security; check R2 settings. |
| **`DATABASE_URL` error on start** | `.env.local` missing or incomplete — compare with `.env.example`. |
| **Forgot admin password** | Another admin resets it in **Staff Team**; or set `SEED_ADMIN_PASSWORD` and re-run `node db/migrate.mjs` (does not delete data). |

---

## 10. Golden rules

1. **Logout** on shared counter computers.
2. **Never share passwords** — create separate staff accounts so the audit log is meaningful.
3. Check **Website Bookings** every morning; confirm appointments by phone.
4. Record every stock arrival as a **Purchase** (or Stock In) — reports and low-stock alerts depend on it.
5. Record every payment in **Pending Payments** — never adjust balances by hand.
6. Only the Admin changes **Settings** and **Staff**; everything there is audit-logged.
7. After any code update: run `npm test` and `npm run build` before restarting.

