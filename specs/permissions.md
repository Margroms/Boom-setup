# Permissions Specification (v2)

## 1. Role Definitions
- MASTER: Platform-level superuser (universe scope). Can manage all brands, outlets, global menus, universal discounts, onboard brands/outlets, assign roles.
- STORE_ADMIN: Scoped to one outlet. Manage outlet-specific item overrides (price/availability), local discounts, process orders, view outlet analytics.
- KITCHEN: Scoped to one outlet. View incoming orders, update preparation statuses.
- CUSTOMER: End user (guest or authenticated) placing orders and tracking them.

## 2. Capability Matrix
| Capability | MASTER | BRAND_ADMIN | STORE_ADMIN | KITCHEN | CUSTOMER |
|------------|--------|-------------|-------------|---------|----------|
| Create Brand | Yes | No | No | No | No |
| Create Outlet | Yes | Yes (within brand) | No | No | No |
| Generate Table QR | Yes | Yes (brand outlets) | Yes (own outlet) | No | No |
| Universal Menu CRUD | Yes | No | No | No | No |
| Brand Menu CRUD | Yes | Yes (own brand) | Limited (override only) | No | No |
| Outlet Menu Override (price/availability) | Yes | Yes (brand outlets) | Yes (own outlet) | No | No |
| Discounts (Universal) | Yes | No | No | No | No |
| Discounts (Brand) | Yes | Yes | No | No | No |
| Discounts (Outlet) | Yes | Yes (brand outlets) | Yes (own outlet) | No | No |
| View All Orders | Yes | Brand scope | Outlet scope | Outlet scope | Own only |
| Update Order Status | Yes | Brand scope (if within brand) | Outlet scope | Outlet scope (limited transitions) | No |
| Cancel Order | Yes | Brand scope (if before PREPARING) | Outlet scope (before PREPARING) | No | No |
| Assign Roles | Yes | Brand roles (BRAND_ADMIN, STORE_ADMIN, KITCHEN within brand) | Outlet roles (KITCHEN) | No | No |
| View Analytics | All | Brand | Outlet | No | No |
| Onboard Outlet | Yes | Yes (own brand) | No | No | No |
| Apply Coupon | N/A | N/A | N/A | N/A | Yes |
| Manage Inventory Availability | Yes | Brand outlets | Own outlet | No | No |
| View Audit Log | Yes | Brand scope | Outlet scope | No | No |

## 3. Scope & Isolation
- Row Level Security (RLS) ensures that brand and outlet scoped roles cannot access rows outside their scope.
- Universal items: stored with isUniversal = true; visible to all outlets unless overridden by outlet-specific availability.
- Outlet overrides: separate mapping table or override columns enabling price/availability mutation without duplicating global item.

## 6. Least Privilege Notes
- STORE_ADMIN cannot modify universal properties (e.g., delete universal item) – only override availability/price.
- KITCHEN limited to status transitions (PREPARING -> READY -> DELIVERED) and cannot revert or cancel (except MASTER/ADMIN).

## 7. Session Types
- Authenticated: Better Auth session (short-lived signed token + refresh) with role & scope claims resolved via UserRole table (Postgres) and supplied to Convex function context.
- Guest: Anonymous signed session cookie (sessionKey) with limited capabilities (cart, apply coupon, create order) until promotion; upgrade merges guest cart & projections.

## 8. Risk Mitigations
- Prevent privilege escalation by disallowing self-role change operations; only higher scope can assign.
- Default deny in Convex functions and Postgres RLS; explicit allow lists enforced.
- Rate limit role assignment & coupon application endpoints (edge + Convex counters).

---
This version supersedes earlier minimal permissions table.