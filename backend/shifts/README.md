# Shifts App

## Responsibility Boundary
The `shifts` app manages the full clinical shift lifecycle and booking dynamics:
- **Explicit Lifecycle State Machine:** Transitions through `draft -> posted -> offered -> confirmed -> in_progress -> completed`, with branches for `cancelled` and `disputed`.
- **First-Accept-Wins Mechanics:** Broadcasts offers to N candidates with race-condition prevention ensuring atomic confirmation.
- **RRULE-Based Recurrence:** Generates recurring shifts from standard templates (RFC 5545).
- **Audit Logging & Notifications:** Emits temporal AuditEvent entries and triggers dispatch hooks on every status delta.
