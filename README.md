# Ghar Ka Hisaab 🏡

A calm, friendly household expense tracker — MVP built with the MERN stack.

## Structure

```
ghar-ka-hisaab/
├── backend/    # Node + Express + MongoDB (Mongoose) + JWT auth
└── frontend/   # React + Vite + Tailwind + React Router
```

## Backend setup

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev             # nodemon, http://localhost:5000
```

### API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/expenses` (filter by `category`, `startDate`, `endDate`)
- `GET /api/dashboard/summary` — today's total, month total, category totals, recent expenses
- `GET/PUT /api/budget`, `GET /api/budget/status` — monthly + category budgets, remaining
- `GET/POST/PUT/DELETE /api/recurring` — Milk, Newspaper, Househelp, WiFi, OTT, etc.
  - `isVariableAmount` (bool): marks the amount as an estimate rather than fixed (e.g. a milk bill that changes slightly month to month) — when `true`, `amount` is optional.
  - `frequency`: `daily` / `weekly` / `monthly` / `yearly`. `dayOfMonth` is the scheduled day for monthly and yearly items; `monthOfYear` (1-12) is only used for yearly items (e.g. an annual insurance renewal on 12 March → `monthOfYear: 3, dayOfMonth: 12`).
  - `reminderEnabled` (bool): turns on the "due today" reminder in the frontend (banner + optional browser notification).
- `GET/POST/PUT/DELETE /api/bills` — Electricity, School Fees, Rent, Cylinder, Phone, WiFi, OTT
  isVariableAmount (bool): marks the amount as an estimate rather than fixed (e.g. a milk bill that changes slightly month to month) — when true, amount is optional.
frequency: daily / weekly / monthly / yearly. dayOfMonth is the scheduled day for monthly and yearly items; monthOfYear (1-12) is only used for yearly items (e.g. an annual insurance renewal on 12 March → monthOfYear: 3, dayOfMonth: 12).
reminderEnabled (bool): turns on the "due" reminder in the frontend (banner + optional browser notification).
POST /api/recurring/:id/pay — marks it paid for the current cycle: creates a matching Expense (same as paying a Bill) and stamps lastPaidDate. Optional { amount } in the body overrides the stored amount for that payment (useful for variable-amount items) and is remembered as the new rolling estimate. Because the reminder check compares lastPaidDate against the current cycle (today for daily, this week/month/year for the others), the reminder automatically goes quiet once paid and starts nagging again on its own once the next cycle's scheduled date arrives — nothing to re-enable manually.
All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

## Frontend setup

```bash
cd frontend
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

## Design

Friendly household style, not a banking app:
- Big, bold numbers (₹38,450 spent this month)
- Simple rounded cards, soft cream background, warm green/orange accents
- Emoji category icons instead of cold line icons
- One clear progress bar for "left to spend" rather than dense tables

## Build order followed

Phase 1 Foundation → Phase 2 Auth → Phase 3 Expenses → Phase 4 Dashboard →
Phase 5 Budget → Phase 6 Recurring → Phase 7 Bills → Phase 8 Reports — all phases are implemented in this MVP.
