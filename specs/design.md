# Design Specification (v3)

## 1. System Overview
High‑volume multi‑brand QR ordering platform. Guests scan table / stall QR codes to load an outlet‑scoped menu, compose carts, apply discounts, and pay through Razorpay. Orders stream live to kitchen & store dashboards with real‑time status transitions. Multi‑tenant (universe → brand → outlet) with strict isolation and low latency (<150ms P95 dynamic API) leveraging:
* Next.js 15 (App Router, Partial Prerendering, Server Actions)
* React 19 (concurrent features, streaming server components)
* Convex (real‑time database + reactive queries + function layer) for operational state (carts, order projections, inventory, discounts usage counters)
* Postgres (via Prisma) as durable ledger and analytics store (immutable orders, payments, audit log, historical aggregates)
* Better Auth (passkeys, magic link email, OAuth providers, optional phone OTP) for strong, flexible authentication

## 2. Technology Stack
Frontend / Edge
- Next.js 15, React 19, Tailwind CSS, Radix UI, Framer Motion
- Edge Middleware: tenant context resolution (brandSlug/outletSlug/tableId) & rate limiting
- PWA: offline shell + last menu snapshot (read‑only)

Realtime & Operational Data
- Convex: primary source for mutable, collaborative data (active carts, current order statuses, kitchen queue, inventory toggles)
- Convex reactive queries avoid manual polling; automatic differential updates

Durable Ledger & Analytics
- Postgres (managed) with Prisma schema: Orders, OrderItems, Payments, AuditLog, DiscountRedemptions, Universal Catalog baseline
- Nightly / periodic rollups for analytics tables (sales_daily, item_performance)

Auth & Identity
- Better Auth providers: Passkeys (WebAuthn), Email Magic Link, Google OAuth, optional Phone OTP (rate limited)
- Session: httpOnly refresh + short‑lived signed session token (15m) with automatic rotation; device fingerprint cookie for abuse detection
- Role/Scope claims appended post login (UserRole lookup) and revalidated per request (server trust boundary)

Payments
 Better Auth session issuance (short TTL signed token + refresh cookie); server actions validate & forward minimal claims to Convex via a verified session context fetch.

Background & Scheduling
This v3 design (updated) replaces prior Supabase-centric approach with Convex real‑time + Postgres ledger and Better Auth powered multi-factor authentication.

Observability
- OpenTelemetry tracing (route handlers, server actions, Convex functions)
- Structured logs (pino) shipped to Axiom/Logtail
- Metrics endpoint: latency histograms, active connections, order throughput, error rates

Security
- Content Security Policy, HTTP security headers, SameSite=strict cookies, CSRF tokens for form posts where needed
- Convex function guards enforce RBAC + scope; Postgres RLS on ledger tables (only backend role connects)
- Razorpay webhook HMAC validation & idempotency

Performance Enhancers
- Partial Prerendering: menu skeleton at edge, streaming in dynamic segments
- Convex diff pushes for low payload real‑time
- Edge caching (ETag, SWR) for static catalog baseline (60s) before live patch overlay
- Optimistic cart mutations (UI updates first, commit to Convex, reconcile)
- Batching: combine successive cart item updates within 150ms window

## 3. Core Domains / Contexts
1. Identity & Access
2. Catalog (Brands, Outlets, Menu Items, Modifiers, Pricing, Availability)
3. Promotions (Discounts, Coupons, Redemptions)
4. Ordering (Cart, Order, Payment, Status Events)
5. Fulfillment (Kitchen queue & status workflow)
6. Onboarding (Brand / Outlet / Table provisioning, QR generation)
7. Analytics (Sales, Performance, Discount efficacy)
8. Integrations (Future: Swiggy, Zomato)

## 4. Architecture Overview
Client → Edge Middleware (tenant context + rate limit) → Next.js Server Components / Actions
Operational state (low-latency) → Convex queries & mutations
Durable ledger writes → Server Action / Webhook → Postgres (transaction) → Convex projection sync
Realtime UI updates → Convex reactive queries (ordersByOutlet, orderStatus, cartBySession, inventoryByOutlet)

### Order Flow Sequence
1. Scan QR (https://boom.app/b/{brand}/o/{outlet}/t/{table})
2. Middleware resolves context; sets headers (x-brand-id, x-outlet-id, x-table-id)
3. Menu shell prerendered + initial static catalog snapshot (cached) streams; Convex subscription hydrates live availability & price overrides
4. Guest cart created (session cookie + optional guest user doc)
5. Coupon validation via Convex mutation (fast path) + (if needed) Postgres discount ledger check
6. Checkout: Server Action creates Razorpay order (idempotent key)
7. Payment success → Webhook: verify signature, create Postgres Order+Payment in transaction, append OrderEvents
8. Projection Updater pushes order doc into Convex (status = PAID)
9. Kitchen dashboard (ordersByOutlet) receives new order; staff updates statuses (PREPARING → READY → DELIVERED)
10. User orderStatus subscription updates timeline in real‑time

## 5. Data Model (Primary Entities)
Postgres (authoritative): Brand, Outlet, Table, User, UserRole, MenuItem (baseline), ModifierGroup, ModifierOption, Discount, DiscountRedemption, Order, OrderItem, Payment, OrderEvent, AuditLog.
Convex (projections / operational): ActiveCart, CartItem, ActiveOrder (denormalized summary), KitchenQueueEntry, InventoryState, DiscountCounter.

Key Projection Fields (ActiveOrder): orderId, outletId, tableId, status, items[{name, qty, mods}], totals{subtotal, discount, tax, total}, placedAt, updatedAt.

Consistency Strategy: Financially critical invariants (totals, payment status) live in Postgres. Convex projections updated after commit (exactly-once via idempotency key). If projection lag occurs, UI can fetch fallback REST detail (/api/orders/:id) from server action hitting Postgres.

## 6. Access Control & Isolation
RBAC enforced in:
* Auth.js (role claims) + server action validation
* Convex functions: early exit if role mismatch; queries filter by brandId/outletId
* Postgres RLS: USING policies ensuring only internal service role; no direct client credentials

Tenant Partitioning: All Convex docs keyed by (brandId, outletId) or global for universe settings. Index patterns to support queries:
* ordersByOutlet: (outletId, createdAt desc)
* kitchenQueue: (outletId, status != 'DELIVERED')

## 7. API / Interaction Surface
Route Handlers / Server Actions:
- POST /api/auth/passkey/register, /login (bridge to Auth.js flows)
- POST /api/checkout/create-order (Razorpay intent)
- POST /api/webhooks/razorpay (signature verify + ledger finalize)
- GET /api/orders/:id (auth scoped)
- POST /api/admin/menu-items, PATCH /api/admin/menu-items/:id
- POST /api/admin/discounts
- GET /api/admin/analytics/sales?range=...

Convex Functions (examples):
- query ordersByOutlet(outletId)
- query orderStatus(orderId)
- query cartBySession(sessionKey)
- query inventoryByOutlet(outletId)
- mutation upsertCartItem(itemId, qty, modifiers)
- mutation applyCoupon(code)
- mutation updateOrderStatus(orderId, newStatus)
- mutation toggleInventory(itemId, isAvailable)
- action finalizePayment(providerPayload) (idempotent)

## 8. Caching & Performance
Layers:
1. Edge CDN: static assets, prerendered menu shell (60s revalidate)
2. Browser SW: offline shell + last snapshot of menu
3. Convex reactive layer: real‑time incremental diffs
4. In-memory LRU in server actions for hot lookup (discount metadata, modifier groups) TTL 30s

Budgets:
* P95 interactive menu load < 1.5s on mid-tier mobile
* P95 API (checkout intent) < 120ms server time
* Realtime status propagation < 2s end-to-end

## 9. Concurrency & Consistency
* Cart writes: optimistic local state → Convex mutation; conflict resolution merges increments
* Payment finalization: idempotency key = providerPaymentId; duplicates ignored
* Stock (Phase 2): Postgres atomic decrement then projection update; 409 on insufficient stock
* Coupon usage: Convex counter + Postgres redemption row (two-phase: reserve → commit on payment)

## 10. Security Model
* Strong Auth: Passkeys priority path; fallback magic link / OAuth / phone OTP
* Rate limits: coupon attempts, OTP requests, payment intents per IP/device
* Input validation: Zod schemas (shared package)
* Secrets: Razorpay keys server-only; environment separation (dev/stage/prod)
* AuditLog entries for admin mutations & order status changes

## 11. Resilience & Observability
* Retry policy: webhook (exponential backoff 5 tries) storing dead-letter when exhausted
* Heartbeat synthetic test for checkout flow every 5 min
* Tracing: span per server action + child spans for DB / Convex calls
* Alerts: payment failure >2% 5m, realtime lag >5s, P95 latency >300ms

## 12. Onboarding Flow
1. Create Brand → default roles & theme
2. Create Outlet (tz, type) → generate table set size N
3. Bulk QR generation (SVG/PNG) → zipped artifact
4. Catalog seeding: copy from universal template or clone existing outlet
5. Invite staff (email/passkey or magic link)
6. Go-Live toggle warms menu prerender & seeds initial projections

## 13. Kitchen Dashboard UX
* Live list auto-sorted by createdAt, color-coded status
* Timer badges (time in status), audible alert on new PAID order
* Bulk READY action (multi-select) with confirm
* Offline / reconnect indicator for realtime health

## 14. Analytics (Phase 1)
* Daily Sales (gross, discount, net) by outlet / brand
* Top Items (qty, gross) windowed by range
* Discount Usage metrics
* Prep Time median & P90 (PAID→READY)

## 15. Accessibility & Internationalization
* WCAG 2.1 AA checklist enforcement (lint + manual)
* All interactive components keyboard & screen reader supported
* Currency formatting (INR initial) – abstraction for multi-currency Phase 2
* I18n scaffolding (messages catalog) for menu text

## 16. Future Extensions
* Aggregator adapter layer (Swiggy, Zomato) mapping inbound orders to internal Order ledger
* Loyalty points ledger (Postgres) + redemption integration
* Dynamic personalization (recent items) precomputed via background job projecting into Convex personalized docs

## 17. Open Questions / Assumptions
* Multi-region deployment Phase 2 (read replicas + edge data) – single region for MVP
* Stock tracking deferred unless high variance menu items require it early
* Tax rules simplified single rate per item; composite tax future
* Refund / partial fulfillment outside MVP

## 18. Definition of Done (Architecture)
* All server actions & Convex functions have input/output Zod validation
* Idempotent payment + webhook path proven via test harness
* Real‑time propagation <2s measured under load test (2K concurrent ordersByOutlet subscriptions)
* Observability dashboards (latency, error rate, throughput) populated & alert rules active
* Security review (auth flows, rate limits, secrets) signed off

---
This v3 design replaces prior Supabase-centric approach with Convex real‑time + Postgres ledger and enhanced multi-factor authentication.
