# Unfinished: pharmacy & Diagnostics module contract

The session hit its limit partway through this wave. Everything below is
resumable — no page is half-written, because each agent finished a page before
moving on. Delete this file when the list is empty.

The contract these pages must reach is
`STYLE-GUIDE.md` → "Module pages — one page per navigation destination":
**What you're looking at → the task(s) → Who can do this → Check it worked →
Common issues → FAQ**, 600–1100 words, one `<Warning>` maximum.

Use an already-finished page as the structural model — `pharmacy/inventory/cipherlab.mdx`
or `lims/imaging/modalities.mdx` are both at the target standard.

## 1. Upgrade to the contract (21 pages)

Each of these has accurate content but lacks `## Who can do this` and a separate
`## FAQ`. Keep what is right; add what is missing.

**Pharmacy**
- [ ] `pharmacy/pos/receipts.mdx`
- [ ] `pharmacy/pos/offline.mdx`
- [ ] `pharmacy/pos/returns.mdx`
- [ ] `pharmacy/money/sales.mdx`
- [ ] `pharmacy/inventory/import-export.mdx`
- [ ] `pharmacy/inventory/transfers.mdx`
- [ ] `pharmacy/customers/index.mdx`
- [ ] `pharmacy/customers/wallet.mdx`
- [ ] `pharmacy/customers/dependents.mdx`
- [ ] `pharmacy/money/billing.mdx`
- [ ] `pharmacy/money/expenses.mdx`
- [ ] `pharmacy/money/analytics.mdx`
- [ ] `pharmacy/hardware/desktop-app.mdx`
- [ ] `pharmacy/hardware/thermal-printer.mdx`
- [ ] `pharmacy/hardware/barcode-scanner.mdx`

**Diagnostics**
- [ ] `lims/lab/worklist.mdx`, `test-requests.mdx`, `accessioning.mdx`,
      `results.mdx`, `reports.mdx`, `turnaround-time.mdx`
- [ ] `lims/dot/index.mdx`, `collection.mdx`,
      `screening-and-confirmation.mdx`, `reports.mdx`, `lab-intake-mode.mdx`
- [ ] `lims/quality/quality-control.mdx`, `analyzers.mdx`
- [ ] `lims/business/referrers.mdx`, `commissions.mdx`, `billing.mdx`,
      `analytics.mdx`
- [ ] `lims/inventory/reagents.mdx`

## 2. Write (12 pages, and re-add each to `docs.json` when it lands)

These are real sidebar rows with no page. Their nav entries were removed so the
tree stays publishable — put them back in the group named beside each.

**Pharmacy** — group "Billing" / "Oversight"
- [ ] `pharmacy/money/payments.mdx` — Billing → Payments. Heading **Payments
      Management**; tabs Overview / Payments / Pending; **New Payment**. For a
      pharmacy the till is the rule and this screen is the exception — account
      customers, institutional buyers, deliveries billed later.
- [ ] `pharmacy/money/services.mdx` — Billing → Services. Heading **Services
      Dashboard**; the header button swaps by tab. For a pharmacy this is
      non-stock chargeables: a delivery fee, a BP check.
- [ ] `pharmacy/money/executive.mdx` — **Today at a glance**, branch select,
      **Today's net (revenue − cost − expenses)**, **Revenue mix this week**,
      Reports card with Export Excel. Needs **Professional**.

**Diagnostics** — groups "Lab workflow", "DOT & workplace testing",
"Referrals & revenue", "Oversight", "Front desk", "Stock"
- [ ] `lims/lab/lab-station.mdx` — the edition's HOME screen and it has no page.
      It is an **analytics dashboard**, not the bench view: tabs Analytics /
      Test List / Reports, where Test List is the test CATALOGUE. The bench
      queue is Worklist. Its Turnaround Time chart is a simple 24-hour-target
      chart, not the TAT dashboard.
- [ ] `lims/dot/history.mdx` — renamed **Intake History** in Reference Lab mode;
      the row disappears entirely in Standard Clinical mode.
- [ ] `lims/business/payments.mdx` — for a lab the payers are often employers
      and referring practices, not the patient.
- [ ] `lims/business/services.mdx` — where a test gets its PRICE, making it the
      commercial twin of Lab Station's **Test List**, which defines the
      analytes. The two are constantly confused; say so explicitly.
- [ ] `lims/business/executive.mdx` — **Owner Summary**, tiles Orders today /
      Collected today / This week / Backlog, cards By site / Top tests /
      Top referring doctors. Needs **Professional**. A lab scientist is denied.
- [ ] `lims/business/lab-analytics.mdx` — needs **Business**. Must distinguish
      three surfaces people confuse: **Lab Analytics** (`/u/clinic/lab-analytics`,
      the lab's operational dashboard), **Analytics** (`/u/clinic/analytics`, the
      report catalogue) and **Executive** (`/u/clinic/executive`, the owner's
      daily summary). Define revenue once: **collected** money on orders
      **created in the range**, not billed.
- [ ] `lims/front-desk/appointment.mdx` — sidebar row is **Appointment**
      (singular). The book has **no heading, no subtitle and no stat cards** —
      it is a full-bleed calendar. The seven-tab dashboard component with
      Bookings / Products / AI Agents / Analytics is **never imported**; do not
      document it. A lab has the book but NOT the booking-page designer.
- [ ] `lims/front-desk/patients.mdx` — `<AuditNote>` required.
- [ ] `lims/inventory/transfers.mdx` — **see the warning below.**

## 3. The correction that must not be lost

`lims/inventory/transfers.mdx` is **not** the pharmacy's branch-transfer screen.
They share the `/u/clinic/transfers` URL through an edition alias but render
completely different components. Do not cross-link the pharmacy page for depth —
it is the wrong screen.

The LIMS screen is `components/clinic/dashboard/lab-station/transfers/transfers-content.tsx`:

- Heading **Specimen Transfers** — "Hand collected specimens to one of your hub
  laboratories. Receiving auto-creates the order at the hub — chain of custody
  carries over, nothing is re-keyed."
- Button **Dispatch specimens**, never disabled; the single-site case is handled
  inside the dialog: "No destination labs found. The owner needs at least one
  full laboratory besides this site to receive specimens."
- No tabs. **Incoming** (hidden entirely at a collection centre) and **Outgoing**.
- Three statuses, no draft: `dispatched` → **In transit**, `received` →
  **Received**, `cancelled` → **Cancelled** (struck through).
- Actions: **Receive & accession** on incoming dispatched; **Cancel** on
  outgoing dispatched. Nothing on received or cancelled rows.
- Role-gated, not plan-gated: owner, lab_scientist, doctor, manager, nurse,
  staff. Denied users see "You don't have permission to manage specimen
  transfers. Please contact your clinic administrator."

Lead with what makes the screen interesting: it is the collection-centre → hub
handoff, and receiving **auto-creates the order at the hub with chain of custody
intact**.

## 4. Then

- [ ] Re-add all 12 pages to `docs.json` in the groups named above.
- [ ] `npm run validate` must pass (it runs the doc checks and compiles every
      page with the real MDX compiler).
- [ ] Delete this file.
