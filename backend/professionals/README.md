# Professionals App

## Responsibility Boundary
The `professionals` app governs healthcare practitioner profiles and credentials:
- **ProfessionalProfile:** Specialization, travel radii, desired rates, reliability score, and instant pay eligibility.
- **Credential Model:** Append-only evidence files, verification statuses (pending, verified, rejected, expired, grace period), and external source-check reference IDs.
- **Availability & Preferences:** Real-time scheduling availability windows and facility affinity/blacklist preferences.
- **Peer References:** Standardized peer questionnaire response tracking with multi-point scoring.
