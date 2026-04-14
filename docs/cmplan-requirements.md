# CMPlan – Configuration Management Module: Requirements

## 1. Overview

CMPlan is an in-house Configuration Management Database (CMDB) module inspired by enterprise platforms (e.g., ServiceNow CMDB). It provides a single source of truth for all IT assets (Configuration Items), their attributes, relationships, and compliance policies — tailored for project and delivery management contexts.

---

## 2. Core Features (Phase 1)

### 2.1 Overview Dashboard
- Summary KPI cards: total CIs, CIs by status, CIs by class, critical CIs
- CI class distribution chart (Pie / Donut)
- CI status breakdown chart (Bar)
- Recently added / modified CIs
- Compliance score widget

### 2.2 Extensible Attribute Settings
- Admins can define **custom attributes** per CI Class (or global)
- Each attribute definition includes:
  - `name` (machine key), `label` (display), `type`, `required`, `defaultValue`, `placeholder`, `options`, `order`, `description`, `isActive`
- Supported attribute types: `text`, `number`, `date`, `datetime`, `select`, `multiselect`, `checkbox`, `textarea`, `url`, `email`, `ip_address`
- Attributes are grouped by **CI Class** (e.g., Server, Database, Application…)
- Global attributes apply to **all** CI Classes
- CRUD for attribute definitions with live preview
- Drag-and-drop reordering (future phase)

### 2.3 Configuration Items (CIs)
- List view with filter bar (class, status, criticality, environment, text search)
- Pagination, column sort
- Add / Edit CI via modal or drawer
- Dynamic attribute fields rendered from attribute definitions
- Tag management per CI
- Soft delete (status: retired)
- CI detail drawer showing all attributes + relationship preview

### 2.4 Relationship Mapping
- Relate two CIs with a typed relationship (depends_on, runs_on, hosts, connects_to, contains, uses)
- Relationship list per CI
- Visual graph view (D3 / ECharts force graph) — Phase 2

### 2.5 Group & Service View
- Group multiple CIs under a named Group / Business Service
- View CIs grouped by Service
- Collapsible tree view

### 2.6 Policy Compliance
- Define policies per CI Class with rules (e.g., "must have owner", "cpu_cores >= 2")
- Auto-evaluate compliance on CI save
- Compliance report per CI and overall score

---

## 3. User Roles & Permissions

| Role        | Dashboard | View CI | Add/Edit CI | Manage Attributes | Manage Policies |
|-------------|-----------|---------|-------------|-------------------|-----------------|
| Viewer      | ✓         | ✓       | ✗           | ✗                 | ✗               |
| Contributor | ✓         | ✓       | ✓           | ✗                 | ✗               |
| Admin       | ✓         | ✓       | ✓           | ✓                 | ✓               |

---

## 4. Non-Functional Requirements
- Performance: CI list loads ≤ 1s for up to 10,000 records (server-side pagination)
- Accessibility: WCAG 2.1 AA
- Responsiveness: desktop-first, 1280px minimum width
- State management: Redux Toolkit (RTK) slices + async thunks
- Code style: ESLint + Prettier, modern React hooks, no class components
- API: RESTful JSON, versioned `/api/v1/cmplan/...`

---

## 5. API Endpoints (planned)

### CI Classes
| Method | Path                        | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /api/v1/cmplan/ci-classes   | List all CI classes     |
| POST   | /api/v1/cmplan/ci-classes   | Create CI class         |
| PUT    | /api/v1/cmplan/ci-classes/:id | Update CI class       |
| DELETE | /api/v1/cmplan/ci-classes/:id | Delete CI class       |

### Attribute Definitions
| Method | Path                                        | Description                      |
|--------|---------------------------------------------|----------------------------------|
| GET    | /api/v1/cmplan/attribute-definitions        | List all (filterable by classId) |
| POST   | /api/v1/cmplan/attribute-definitions        | Create attribute definition      |
| PUT    | /api/v1/cmplan/attribute-definitions/:id    | Update attribute definition      |
| DELETE | /api/v1/cmplan/attribute-definitions/:id    | Delete attribute definition      |
| PATCH  | /api/v1/cmplan/attribute-definitions/reorder| Reorder attributes               |

### Configuration Items
| Method | Path                               | Description           |
|--------|------------------------------------|-----------------------|
| GET    | /api/v1/cmplan/items               | List CIs (paginated)  |
| GET    | /api/v1/cmplan/items/:id           | Get CI detail         |
| POST   | /api/v1/cmplan/items               | Create CI             |
| PUT    | /api/v1/cmplan/items/:id           | Update CI             |
| DELETE | /api/v1/cmplan/items/:id           | Delete (soft) CI      |
| GET    | /api/v1/cmplan/items/:id/relations | Get CI relationships  |

### CI Relationships
| Method | Path                           | Description             |
|--------|--------------------------------|-------------------------|
| GET    | /api/v1/cmplan/relationships   | List relationships      |
| POST   | /api/v1/cmplan/relationships   | Create relationship     |
| DELETE | /api/v1/cmplan/relationships/:id | Delete relationship   |

### Groups
| Method | Path                    | Description    |
|--------|-------------------------|----------------|
| GET    | /api/v1/cmplan/groups   | List groups    |
| POST   | /api/v1/cmplan/groups   | Create group   |
| PUT    | /api/v1/cmplan/groups/:id | Update group |
| DELETE | /api/v1/cmplan/groups/:id | Delete group |

### Compliance
| Method | Path                               | Description              |
|--------|------------------------------------|--------------------------|
| GET    | /api/v1/cmplan/policies            | List policies            |
| POST   | /api/v1/cmplan/policies            | Create policy            |
| PUT    | /api/v1/cmplan/policies/:id        | Update policy            |
| GET    | /api/v1/cmplan/compliance/summary  | Overall compliance score |
| GET    | /api/v1/cmplan/compliance/items    | Per-CI compliance report |
