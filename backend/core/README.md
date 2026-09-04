# Core App

## Responsibility Boundary
The `core` app encapsulates foundational multi-tenant hierarchy and platform-wide invariants:
- **Organization & Facility Tree:** Multi-level container modeling `Organization -> Facility -> Site -> Department (Ward)`.
- **TenantScopedManager:** Enforces tenant isolation automatically across all descendant queries, preventing cross-organization leakage without requiring ad hoc filters.
- **LockedModelQuerySet:** Guarantees financial and timesheet immutability at the queryset level by rejecting bulk mutations on approved or locked records.
- **AuditEvent:** Append-only ledger recording all actor actions, before/after JSON states, and temporal timestamps for full regulatory auditability.
