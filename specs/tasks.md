# Tasks Specification (v3)

## 0. Guiding Principles
- Ship vertical slices (guest scan → menu → cart → payment → kitchen visibility) early.
- Secure & observable baseline before scale optimizations.
- Each task references domain + layer (UI / API / DB / Infra / QA).

Legend: (UI), (API), (DB), (INFRA), (QA), (SEC), (OBS)

## Epic 1: Project & Environment Setup
- [ ] Initialize Next.js 15 App Router project (UI/INFRA)
- [ ] Configure TypeScript strict, ESLint, Prettier, Husky pre-commit (INFRA)
- [ ] Add Tailwind CSS + base design system tokens (UI)
- [ ] Setup Convex project & dev deployment (INFRA)
- [ ] Environment variable management & secret loading (INFRA/SEC)
- [ ] Observability bootstrap (logger, trace id middleware, OTEL config) (OBS)
s

## Epic 3: Auth & Role System
- [ ] Better Auth config (Passkeys, Magic Link, Google OAuth, optional Phone OTP) (API/SEC)
- [ ] User provisioning hook (create User + default roles) (API)
- [ ] Role assignment endpoints (MASTER) (API/SEC)
- [ ] Middleware (edge) injects tenant + user scope (API)
- [ ] Guest session cookie (signed, httpOnly) fallback (API/SEC)
- [ ] Merge guest cart into user on login (Convex mutation) (API)
- [ ] Token bridge to Convex identity context (API/SEC)
- [ ] Better Auth session rotation & refresh flow tests (QA/SEC)

## Epic 4: QR Context & Menu Delivery
- [ ] QR URL pattern & edge middleware parsing (UI/API)
- [ ] Menu partial prerender shell (UI)
- [ ] Edge cached catalog snapshot endpoint (API)
- [ ] Convex availability reactive query (UI/API)
- [ ] Modifier selection UI component (UI)
- [ ] Performance test (100 items) (QA/OBS)

## Epic 5: Cart & Discounts
- [ ] Convex cart create/upsert mutations (API)
- [ ] Cart item add/update/remove mutations (API)
- [ ] Optimistic cart hooks & local persistence (UI)
- [ ] Discount validation (Convex fast path + Postgres authoritative) (API/DB)
- [ ] Discount application logic (single coupon) (API/DB)
- [ ] Unit tests: pricing & discount edge cases (QA)

## Epic 6: Checkout & Payment
- [ ] Razorpay order creation server action (API)
- [ ] Client integration with Razorpay SDK (UI)
- [ ] Payment webhook route (API/SEC)
- [ ] Idempotency & signature validation (API/SEC)
- [ ] Order finalize logic (Postgres + Convex projection) (API/DB)
- [ ] Failure + retry flows (API)

## Epic 7: Order Lifecycle & Realtime
- [ ] Convex order status reactive query (UI/API)
- [ ] Order tracker UI (UI)
- [ ] Kitchen orders reactive query (UI/API)
- [ ] Status transition mutation w/ rules (API/SEC)
- [ ] Projection emission on status change (API)
- [ ] Latency measurement instrumentation (OBS)

## Epic 8: Kitchen & Store Dashboards
- [ ] Kitchen dashboard layout + filters (UI)
- [ ] Store admin dashboard (orders + quick stats) (UI)
- [ ] Bulk status update (ready all) action (API/UI)
- [ ] Sound / visual alerts on new order (UI)
- [ ] Access control test suite (QA/SEC)
- [ ] Realtime queue performance test (QA/OBS)

## Epic 9: Menu & Inventory Management
- [ ] Admin CRUD endpoints for menu items (API)
- [ ] Modifier groups management (API/UI)
- [ ] Outlet price/availability override model (DB)
- [ ] Convex inventory toggle mutation + reactive updates (API/UI)
- [ ] Image upload (storage + signed URL) (API/UI)

## Epic 10: Discounts & Coupons
- [ ] Discount CRUD (universal/brand/outlet) (API/UI)
- [ ] Coupon code generation (API)
- [ ] Redemption tracking (Postgres + projection counter) (DB)
- [ ] Rate limiting coupon attempts (SEC)
- [ ] Admin discount analytics mini report (UI/API)

## Epic 11: Onboarding Workflow
- [ ] Brand creation wizard (UI)
- [ ] Outlet creation form (UI)
- [ ] Table bulk generation + QR asset export (API/UI)
- [ ] Menu template clone function (API)
- [ ] Invite user (email / passkey enrollment link) flow (API/UI)
- [ ] Projection warm-up after outlet creation (API)

## Epic 12: Analytics & Reporting (Phase 1)
- [ ] Sales aggregation query (DB)
- [ ] Daily summary endpoint (API)
- [ ] Top items endpoint (API)
- [ ] Prep time calculation (API)
- [ ] Dashboard charts (UI)
- [ ] Projection reconciliation job (INFRA)

## Epic 13: Audit & Logging
- [ ] AuditLog write helper (API)
- [ ] Middleware attach correlation id (API)
- [ ] Admin audit viewer (UI)
- [ ] Log redaction filter (SEC)
- [ ] Convex function wrapper adds traceIds (OBS)

## Epic 14: Performance & Hardening
- [ ] Load test scenario scripts (QA)
- [ ] Query plan review & index tuning (DB)
- [ ] Add ETag/Last-Modified to menu responses (API)
- [ ] Implement rate limiting (edge + function-level) (SEC)
- [ ] Implement caching layer stubs (future Redis toggle) (INFRA)
- [ ] Realtime subscription scale test (QA/OBS)

## Epic 15: PWA & Mobile Enhancements
- [ ] Web App Manifest & icons (UI)
- [ ] Service worker (offline shell + last menu snapshot + Convex reconnect) (UI)
- [ ] Add to Home prompt logic (UI)
- [ ] Touch optimization (UI)

## Epic 16: Testing & Quality
- [ ] Unit test suites (pricing, discount, status transitions, projection sync) (QA)
- [ ] Integration tests (API) (QA)
- [ ] E2E flows (guest to delivered) (QA)
- [ ] Security tests (RBAC / function guards) (QA/SEC)
- [ ] Performance regression pipeline (OBS)

## Epic 17: Deployment & Release
- [ ] CI pipeline (lint, typecheck, tests, build) (INFRA)
- [ ] Preview environments per PR (INFRA)
- [ ] Staging smoke tests automation (QA)
- [ ] Version tagging + changelog automation (INFRA)

## Epic 18: Post MVP Backlog (Future)
- [ ] Stock decrement logic
- [ ] Multi-currency pricing
- [ ] Swiggy/Zomato integration adapter
- [ ] Loyalty points system
- [ ] Refund & partial order adjustment
- [ ] Multi-region replication & latency routing

## Cross-Cutting Tasks
- [ ] Zod schema library for shared validation (API/UI)
- [ ] Shared types package (UI/API)
- [ ] Error normalization (API/UI)
- [ ] Theming (brand color overrides) (UI)
- [ ] Convex function guard helper (SEC)
- [ ] Idempotency middleware (payments & projections) (SEC)

## Milestone Slicing (Indicative)
Milestone 1 (Weeks 1-2): Epics 1-4 subset (scan → view menu) 
Milestone 2 (Weeks 3-4): Epics 5-6 (cart + payment) 
Milestone 3 (Weeks 5-6): Epics 7-8 (order lifecycle + dashboards) 
Milestone 4 (Weeks 7-8): Epics 9-11 (admin mgmt + onboarding) 
Milestone 5 (Weeks 9-10): Epics 12-14 (analytics + performance) 
Milestone 6 (Weeks 11-12): Epics 15-17 (PWA + release polish) 

## Definition of Done (Per Task)
- Code merged with tests & type safety
- Auth & function guards validated (RBAC tests)
- Observability hooks present (log/trace/span)
- Documentation updated (README / inline JSDoc)
- Performance budgets not regressed

---
This expanded tasks list supersedes earlier version.