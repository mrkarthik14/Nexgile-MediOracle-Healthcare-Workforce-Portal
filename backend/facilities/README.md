# Facilities App

## Responsibility Boundary
The `facilities` app provides operational command & control for hospital administrators and ward charge nurses:
- **Floor Dashboard (`/api/facilities/{id}/floor-dashboard`):** High-throughput, read-optimized aggregated endpoint delivering real-time ward staffing ratios, acuity-weighted risk thresholds (green/yellow/red), open shift deficit, and time-to-fill velocity.
- **Budget Tracking:** Monitors ward spend vs. department allocations.
- **Optimized Polling:** Designed with low-overhead queries and timestamp delta filtering for 10-15 second polling cycles.
