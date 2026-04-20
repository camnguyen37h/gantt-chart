# Existing Relationships (MOCK_CI_RELATIONSHIPS)

## Pair Format: `sourceId-relationshipType-targetId`

| # | Pair Key | Source | Type | Target |
|---|---|---|---|---|
| 1 | `ci-006-depends_on-ci-007` | CRM Web Portal | depends_on | Business Plan API Service |
| 2 | `ci-007-depends_on-ci-004` | Business Plan API Service | depends_on | prod-postgresql-01 |
| 3 | `ci-007-uses-ci-005` | Business Plan API Service | uses | prod-redis-cache |
| 4 | `ci-006-runs_on-ci-001` | CRM Web Portal | runs_on | prod-web-01 |
| 5 | `ci-007-uses-ci-014` | Business Plan API Service | uses | RabbitMQ Cluster |
| 6 | `ci-001-connects_to-ci-009` | prod-web-01 | connects_to | Core Switch DC1 |
| 7 | `ci-004-runs_on-ci-013` | prod-postgresql-01 | runs_on | NetApp FAS - Primary SAN |
| 8 | `ci-011-hosts-ci-006` | Azure AKS Cluster - Prod | hosts | CRM Web Portal |
| 9 | `ci-011-hosts-ci-007` | Azure AKS Cluster - Prod | hosts | Business Plan API Service |
| 10 | `ci-011-hosts-ci-008` | Azure AKS Cluster - Prod | hosts | CMPlan API Service |

## Validate Example

Nếu user chọn:
- **Source**: `ci-011` (Azure AKS Cluster - Prod)
- **Target**: `ci-006`, `ci-007`, `ci-008`
- **Rule type**: `hosts`

→ Cả 3 relationships (#8, #9, #10) sẽ hiện **"Exists"** (background vàng, opacity mờ) trong Preview.

## API Response Format

```
GET /api/relationships/existing-pairs

Response: string[]
[
  "ci-006-depends_on-ci-007",
  "ci-007-depends_on-ci-004",
  "ci-007-uses-ci-005",
  "ci-006-runs_on-ci-001",
  "ci-007-uses-ci-014",
  "ci-001-connects_to-ci-009",
  "ci-004-runs_on-ci-013",
  "ci-011-hosts-ci-006",
  "ci-011-hosts-ci-007",
  "ci-011-hosts-ci-008"
]
```
