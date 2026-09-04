# Compliance App

## Responsibility Boundary
The `compliance` app safeguards patient safety and clinical regulatory standards:
- **Configurable Compliance Rules:** No hardcoded jurisdictional magic numbers. Rest periods, weekly hour caps, and mandatory qualifications are dynamically modeled per health trust or facility.
- **Unified EligibilityService:** Single source of truth evaluating mandatory certifications, expiration deadlines, and rest-period minimums at offer, booking confirmation, and clock-in.
- **Verification Review Queue:** Workflow for credential verification officers with primary source registry checks.
- **Pluggable OCR Interface:** Scans incoming documents for automatic field extraction and fraud prevention.
