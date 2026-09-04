# Matching App

## Responsibility Boundary
The `matching` app provides the intelligent recommendation engine connecting hospital shifts with qualified professionals:
- **Pluggable Architecture:** `MatchingEngineInterface` abstraction allows replacing the heuristics engine with an ML/deep model without changing calling code.
- **RuleBasedMatchingEngine:** Computes weighted contributions across qualifications (30%), commute/distance (20%), reliability history (20%), rate fit (15%), and preference synergy (15%).
- **Explainability:** Always returns a structured `factor_breakdown` dictionary and an intuitive summary narrative.
- **Facility Overrides:** Empowers ward managers to override matching decisions with a compulsory audit reason.
- **First-Accept-Wins Broadcasts:** Distributes real-time offers across candidate tiers with race-condition mitigation.
