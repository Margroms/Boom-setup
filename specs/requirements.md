# Requirements Specification (v3)

## 1. Functional Requirements
FR1 QR Menu Access: User scans QR (URL encodes brand + outlet + table) and receives context-aware partially prerendered menu shell + live data stream.
FR2 Guest Session Handling: Anonymous session (signed httpOnly cookie) convertible to authenticated user without cart loss.
FR3 Menu Browsing: Categories, items, modifiers, availability, pricing, tax display.
FR4 Cart Management: Add/update/remove items with modifiers; persistent across refresh for session lifetime (24h) or until checkout.
FR5 Coupon & Discount Application: Validate code (scope + time + limits) through Convex fast path + Postgres authoritative check; single coupon stack Phase 1.
FR6 Tax Calculation: Apply per-item tax rate to compute taxTotal; show inclusive/exclusive labels.
FR7 Checkout & Payment: Create Razorpay order (idempotent) via server action, redirect/hosted capture, webhook-based confirmation with projection update.
FR8 Order Creation: On payment success finalize order, snapshot items, quantities, prices, applied discount.
FR9 Order Status Tracking: Convex reactive queries push PREPARING, READY, DELIVERED status changes within <2s.
FR10 Kitchen Dashboard: List active orders, update status, see item detail & elapsed time.
FR11 Admin (Master) Management: CRUD brands, outlets, universal menu items, universal discounts, view analytics.
FR12 Brand Admin: Manage brand-scoped menu, discounts, view brand analytics.
FR13 Store Admin: Manage outlet menu overrides (price, availability), local discounts, monitor orders.
FR14 Inventory / Availability: Toggle item availability (manual) via Convex; optional atomic stock decrement Phase 2.
FR15 Onboarding Workflow: Create outlet + generate table QR codes in bulk with downloadable assets.
FR16 Role & Permission Management: Assign roles to users with scoping (brand/outlet) via invite flow.
FR17 Audit Trail: Record critical admin changes (menu CRUD, discounts, status overrides).
FR18 Reporting: Daily sales summary (gross, discounts, net) by outlet & brand.
FR19 Error Feedback: User-friendly error messages (payment failure, coupon invalid, item unavailable).
FR20 Accessibility: Keyboard navigation & ARIA for menus, forms, order tracking.
FR21 PWA Support: Installable app manifest + offline shell + last menu snapshot (read-only) with replay to live stream.
FR22 Session Recovery: If payment success but network drop, user can refresh and see order state.
FR23 Cancellation: Admin/Store can cancel order before PREPARING (refund initiation future phase).
FR24 Guest Upgrade: Guest can sign in mid-session to attach existing cart.
FR25 Rate Limiting: Prevent coupon brute force & payment endpoint abuse.

## 2. Non-Functional Requirements
NFR1 Performance: P95 API/server action latency <150ms (in-region); P99 <300ms; realtime diff delivery <2s.
NFR2 Scale: Support 10K+ concurrent guests, 2K concurrent realtime subscriptions per outlet cluster, 500 orders/min burst.
NFR3 Availability: Target 99.9% uptime for core ordering endpoints.
NFR4 Consistency: Monetary + stock operations ACID; eventual consistency acceptable for analytics.
NFR5 Security: Enforce least privilege via Convex function guards + Postgres RLS; no sensitive keys client-side; Better Auth session token expiry 15m with rotation.
NFR6 Compliance: Payment flows defer card handling to Razorpay (PCI DSS scope minimized). Store audit logs 180 days.
NFR7 Observability: 100% of API requests have trace id; error rate and latency dashboards; alerting thresholds defined.
NFR8 Resilience: Automatic retry (<=3) for transient DB / Convex write conflicts; webhook & payment finalize idempotent.
NFR9 Localization: Currency formatting; language externalization framework ready (Phase 2 translation data).
NFR10 Accessibility: WCAG 2.1 AA conformance for user-facing flows.
NFR11 Maintainability: Module boundaries (Catalog, Orders, Discounts) separated; cyclomatic complexity monitored (lint rule).
NFR12 Test Coverage: Critical domain logic (discount application, order total, payment finalization, projection sync) >90% branch coverage.
NFR13 Data Retention: Soft delete vs hard delete; orders retained indefinitely; logs 180 days; ephemeral carts purged after 24h inactivity.
NFR14 Privacy: Only necessary PII (email/phone) stored; phone optional for stall scanning scenario.
NFR15 Mobile Performance: LCP <2.0s, TTI <3.0s on mid-tier Android over Fast 3G.
NFR16 SEO (Optional): Basic meta for menu pages; not core for QR flows but helpful for brand discoverability.
NFR17 Backup & Recovery: Daily automated DB backups with 7-day point-in-time recovery window.
NFR18 Idempotency: Payment + webhook + projection update + (future) stock decrement idempotent via unique keys.
NFR19 Rate Limits: Default 120 requests/min per IP for public endpoints; tighter (30/min) for coupon validate.
NFR20 Logging: Structured JSON, PII redaction (phone/email hashed in logs).

## 3. Role Matrix (Summary Reference)
See permissions.md for full details; requirements rely on enforcement of matrix to satisfy security & data isolation.

## 4. Assumptions
A1 Stock tracking Phase 2 except availability toggles now.
A2 Single currency (INR) Phase 1.
A3 Single region deployment (India) Phase 1; multi-region read replicas Phase 2.
A4 Aggregator integration out of scope Phase 1.

## 5. Dependencies
D1 Next.js 14+ (App Router)
D2 Supabase (Postgres, Auth, Realtime, Storage)
D3 Prisma ORM
D4 Razorpay API & Webhooks
D5 Zod (validation), Convex client (reactive data), Tailwind CSS.

## 6. Acceptance Criteria Examples
- Applying valid coupon returns discounted total and records tentative redemption reservation.
- Kitchen status change propagates to user UI within <2s.
- Payment webhook processed exactly once even if Razorpay retries.
- Unauthorized store admin cannot modify another brand's menu (403).
- Latency SLO dashboards show compliance under load test.

## 7. Open Risks & Mitigations
R1 Realtime subscription overload -> Partition queries (pagination / status filtered), enforce subscription caps per client.
R2 Payment webhook race (user polling) -> Order finalize route checks existing Payment row, returns consistent state.
R3 Large menu payloads -> Partial prerender + streaming + diff-based availability updates only.
R4 Discount abuse (multiple guest sessions) -> Device fingerprint cookie + per-IP + per-discount rate checks.

---
This version supersedes earlier minimal requirements document.