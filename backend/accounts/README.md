# Accounts App

## Responsibility Boundary
The `accounts` app governs identity, authentication, and authorization across all healthcare user archetypes:
- **Custom User:** Central model supporting 11 distinct healthcare personas (Facility Admin, Ward Lead, Professional, Agency Admin, Recruiter, Compliance Officer, Payroll, etc.).
- **OrganizationMembership:** Row-level multi-tenant association linking users to parent health trusts and facility scopes.
- **JWT Authentication:** SimpleJWT integration with custom token claims (email, name, role).
- **Composable Permissions:** Granular DRF permission classes (`HasRole`, `IsFacilityMember`) ensuring zero access leakage across wards or agencies.
- **Dynamic Permissions Endpoint:** `/api/me/permissions` supplies the React front-end shell with allowed navigation tabs and facility boundaries.
