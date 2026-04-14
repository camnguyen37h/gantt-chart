# CMPlan – Database Design

## Entity Relationship Diagram (Logical)

```
ci_classes ──< attribute_definitions
ci_classes ──< configuration_items
configuration_items ──< ci_attributes (via JSON column)
configuration_items ──< ci_relationships (as source & target)
ci_groups >──< configuration_items (via ci_group_members)
compliance_policies ──< compliance_evaluations ──> configuration_items
```

---

## Table Definitions

### 1. `ci_classes`
Master list of CI types (Server, Database, Application, etc.)

| Column        | Type         | Constraints            | Description                      |
|---------------|--------------|------------------------|----------------------------------|
| id            | VARCHAR(36)  | PK, UUID               | Unique identifier                |
| name          | VARCHAR(100) | UNIQUE, NOT NULL       | Machine key (e.g., `server`)     |
| label         | VARCHAR(200) | NOT NULL               | Display name (e.g., `Server`)    |
| icon          | VARCHAR(100) |                        | Icon identifier (antd icon name) |
| color         | VARCHAR(20)  |                        | HEX color for UI badge           |
| description   | TEXT         |                        | Short description                |
| sort_order    | INT          | DEFAULT 0              | Display order in UI              |
| is_active     | BOOLEAN      | DEFAULT true           | Soft disable                     |
| created_at    | TIMESTAMP    | DEFAULT now()          |                                  |
| updated_at    | TIMESTAMP    | DEFAULT now()          |                                  |

**Sample data:**
```
server          → Server            (hdd, #1890ff)
database        → Database          (database, #722ed1)
application     → Application       (appstore, #13c2c2)
network_device  → Network Device    (cluster, #fa8c16)
cloud_service   → Cloud Service     (cloud, #52c41a)
virtual_machine → Virtual Machine   (desktop, #eb2f96)
storage         → Storage           (save, #a0d911)
middleware      → Middleware        (api, #096dd9)
```

---

### 2. `attribute_definitions`
Defines extensible/custom attributes for each CI Class (or globally).

| Column        | Type         | Constraints          | Description                                         |
|---------------|--------------|----------------------|-----------------------------------------------------|
| id            | VARCHAR(36)  | PK, UUID             |                                                     |
| ci_class_id   | VARCHAR(36)  | FK → ci_classes.id, NULLABLE | NULL = global attribute (applies to all classes) |
| name          | VARCHAR(100) | NOT NULL             | Machine key used as JSON key in `attributes` column |
| label         | VARCHAR(200) | NOT NULL             | Display label                                       |
| type          | ENUM         | NOT NULL             | text/number/date/datetime/select/multiselect/checkbox/textarea/url/email/ip_address |
| is_required   | BOOLEAN      | DEFAULT false        |                                                     |
| default_value | TEXT         |                      | JSON-serialized default                             |
| options       | JSON         |                      | Array of `{label, value}` for select/multiselect    |
| placeholder   | VARCHAR(300) |                      | UI placeholder text                                 |
| description   | TEXT         |                      | Helper text shown under field                       |
| sort_order    | INT          | DEFAULT 0            | Display order within class                          |
| is_active     | BOOLEAN      | DEFAULT true         |                                                     |
| created_at    | TIMESTAMP    | DEFAULT now()        |                                                     |
| updated_at    | TIMESTAMP    | DEFAULT now()        |                                                     |

**Unique constraint:** `(ci_class_id, name)` — prevents duplicate attribute names per class.

---

### 3. `configuration_items`
Core CI records. Dynamic attributes stored as JSON column.

| Column            | Type         | Constraints           | Description                                      |
|-------------------|--------------|-----------------------|--------------------------------------------------|
| id                | VARCHAR(36)  | PK, UUID              |                                                  |
| ci_class_id       | VARCHAR(36)  | FK → ci_classes.id    |                                                  |
| name              | VARCHAR(300) | NOT NULL              | Human-readable CI name                           |
| short_description | TEXT         |                       | Brief description                                |
| status            | ENUM         | DEFAULT 'active'      | active/inactive/maintenance/retired/pending       |
| criticality       | ENUM         | DEFAULT 'medium'      | low/medium/high/critical                         |
| owner             | VARCHAR(200) |                       | Owner user/email                                 |
| department        | VARCHAR(200) |                       |                                                  |
| location          | VARCHAR(300) |                       | Physical / logical location                      |
| environment       | ENUM         | DEFAULT 'production'  | production/staging/development/testing/dr        |
| tags              | JSON         | DEFAULT '[]'          | String array of tags                             |
| attributes        | JSON         | DEFAULT '{}'          | Dynamic attributes keyed by attribute_definition.name |
| compliance_status | ENUM         | DEFAULT 'unknown'     | compliant/non_compliant/unknown/exempt           |
| compliance_score  | FLOAT        |                       | 0–100                                            |
| created_by        | VARCHAR(200) |                       | User who created                                 |
| updated_by        | VARCHAR(200) |                       |                                                  |
| created_at        | TIMESTAMP    | DEFAULT now()         |                                                  |
| updated_at        | TIMESTAMP    | DEFAULT now()         |                                                  |

---

### 4. `ci_relationships`
Directed relationships between two CIs.

| Column            | Type         | Constraints              | Description                        |
|-------------------|--------------|--------------------------|------------------------------------|
| id                | VARCHAR(36)  | PK, UUID                 |                                    |
| source_id         | VARCHAR(36)  | FK → configuration_items |                                    |
| target_id         | VARCHAR(36)  | FK → configuration_items |                                    |
| relationship_type | ENUM         | NOT NULL                 | depends_on/runs_on/hosts/connects_to/contains/uses/monitors/backs_up |
| description       | TEXT         |                          |                                    |
| created_by        | VARCHAR(200) |                          |                                    |
| created_at        | TIMESTAMP    | DEFAULT now()            |                                    |

**Unique constraint:** `(source_id, target_id, relationship_type)`

---

### 5. `ci_groups`
Named collections of CIs (Business Services, Applications, Environments).

| Column      | Type         | Constraints    | Description                     |
|-------------|--------------|----------------|---------------------------------|
| id          | VARCHAR(36)  | PK, UUID       |                                 |
| name        | VARCHAR(300) | NOT NULL       |                                 |
| description | TEXT         |                |                                 |
| group_type  | ENUM         | DEFAULT 'misc' | service/environment/application/team/misc |
| owner       | VARCHAR(200) |                |                                 |
| color       | VARCHAR(20)  |                |                                 |
| created_at  | TIMESTAMP    | DEFAULT now()  |                                 |
| updated_at  | TIMESTAMP    | DEFAULT now()  |                                 |

### 6. `ci_group_members`
M:N join table between groups and CIs.

| Column      | Type        | Constraints              |
|-------------|-------------|--------------------------|
| group_id    | VARCHAR(36) | FK → ci_groups           |
| ci_id       | VARCHAR(36) | FK → configuration_items |
| added_at    | TIMESTAMP   | DEFAULT now()            |

**PK:** `(group_id, ci_id)`

---

### 7. `compliance_policies`
Policy definitions for automated CI compliance checks.

| Column       | Type         | Constraints      | Description                            |
|--------------|--------------|------------------|----------------------------------------|
| id           | VARCHAR(36)  | PK, UUID         |                                        |
| name         | VARCHAR(300) | NOT NULL         |                                        |
| description  | TEXT         |                  |                                        |
| ci_class_id  | VARCHAR(36)  | FK NULLABLE      | NULL = applies to all classes          |
| rules        | JSON         | NOT NULL         | Array of rule objects (see below)      |
| severity     | ENUM         | DEFAULT 'medium' | low/medium/high/critical               |
| is_active    | BOOLEAN      | DEFAULT true     |                                        |
| created_at   | TIMESTAMP    |                  |                                        |
| updated_at   | TIMESTAMP    |                  |                                        |

**Rule object structure (JSON):**
```json
{
  "id": "uuid",
  "field": "owner",
  "operator": "not_empty",
  "value": null,
  "message": "Owner must be specified"
}
```
Supported operators: `not_empty`, `equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `in`, `not_in`, `regex`

---

### 8. `compliance_evaluations`
Evaluation results per CI per policy (computed on CI save).

| Column      | Type         | Constraints              | Description          |
|-------------|--------------|--------------------------|----------------------|
| id          | VARCHAR(36)  | PK, UUID                 |                      |
| ci_id       | VARCHAR(36)  | FK → configuration_items |                      |
| policy_id   | VARCHAR(36)  | FK → compliance_policies |                      |
| passed      | BOOLEAN      | NOT NULL                 |                      |
| violations  | JSON         | DEFAULT '[]'             | Array of rule violations |
| evaluated_at| TIMESTAMP    | DEFAULT now()            |                      |

---

## Indexing Strategy

```sql
-- configuration_items
INDEX idx_ci_class_id ON configuration_items(ci_class_id);
INDEX idx_ci_status ON configuration_items(status);
INDEX idx_ci_criticality ON configuration_items(criticality);
INDEX idx_ci_environment ON configuration_items(environment);
INDEX idx_ci_created_at ON configuration_items(created_at DESC);

-- attribute_definitions
INDEX idx_attr_class_id ON attribute_definitions(ci_class_id);
INDEX idx_attr_active ON attribute_definitions(is_active);

-- ci_relationships
INDEX idx_rel_source ON ci_relationships(source_id);
INDEX idx_rel_target ON ci_relationships(target_id);
```

---

## JSON Attribute Schema Example

For a CI of class `server`, the `attributes` JSON column might look like:
```json
{
  "cpu_cores": 16,
  "ram_gb": 64,
  "os_type": "linux",
  "os_version": "Ubuntu 22.04 LTS",
  "ip_address": "10.0.1.55",
  "hostname": "prod-srv-01",
  "managed_by": "Ansible"
}
```

---

## Data Migration Notes
- Attribute definitions versioning: when an attribute `name` is changed, update all CI `attributes` JSONs via migration script.
- Soft deletes: use `status: retired` for CIs, `is_active: false` for attribute definitions.
