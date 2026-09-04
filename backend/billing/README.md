# Billing App

## Responsibility Boundary
The `billing` app controls financial integrity, invoicing, and remittance:
- **Exception-Safe Accounting:** Approved timesheets and invoices are locked at the database level. Post-approval adjustments require an explicit `Adjustment` row referencing the original record.
- **Double-Payment Prevention:** Enforces DB uniqueness constraint on `(professional, shift, payment_type)`.
- **Instant Pay Pipeline:** Allows eligible clinical professionals to claim instant earnings upon shift completion with fee deduction.
- **Aging & Invoicing Buckets:** Tracks invoice lifecycle across 0-30, 31-60, 61-90, and 90+ day delinquency categories.
