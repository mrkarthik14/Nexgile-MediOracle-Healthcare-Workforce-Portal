# Timekeeping App

## Responsibility Boundary
The `timekeeping` app records physical shift delivery and enforces financial lock integrity:
- **GPS-Gated Clock Events:** Real-time geofence calculation testing mobile coordinates against hospital radii server-side with anti-tamper rejection.
- **Locked Timesheets:** Once a timesheet enters the `approved` state, it is locked at the QuerySet level against bulk updates.
- **Incident Reporting:** Secure, audited incident reporting channel for clinical risk and safety compliance.
