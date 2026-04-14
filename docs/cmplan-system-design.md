# CMPlan – System & Frontend Architecture Design

## 1. Frontend Folder Structure

```
src/
├── pages/
│   └── CMPlan/
│       ├── CMPlanDashboardPage.jsx       # Overview Dashboard
│       ├── AttributeSettingsPage.jsx     # Extensible Attribute Settings
│       └── ConfigurationItemsPage.jsx    # CI List / Add / Edit
│
├── components/
│   └── CMPlan/
│       ├── Dashboard/
│       │   ├── CIStatsCards.jsx          # KPI summary row
│       │   ├── CIClassDistributionChart.jsx
│       │   ├── CIStatusChart.jsx
│       │   └── RecentCITable.jsx
│       │
│       ├── AttributeSettings/
│       │   ├── CIClassTabs.jsx           # Tab per CI class + Global
│       │   ├── AttributeDefinitionTable.jsx
│       │   ├── AttributeFormModal.jsx    # Add/Edit attribute modal
│       │   └── AttributeTypeIcon.jsx
│       │
│       └── ConfigurationItems/
│           ├── CIFilterBar.jsx           # Search + multi-filter bar
│           ├── CITable.jsx               # Ant Design Table
│           ├── CIFormModal.jsx           # Add/Edit CI modal (dynamic fields)
│           ├── CIDynamicFields.jsx       # Renders fields from attr definitions
│           ├── CIDetailDrawer.jsx        # Side drawer for CI detail view
│           ├── CITagList.jsx
│           └── CIStatusBadge.jsx
│
├── store/
│   └── cmplan/
│       ├── index.js                      # Re-exports all slices
│       ├── ciClassesSlice.js             # CI classes state
│       ├── attributeDefinitionsSlice.js  # Attribute definitions state
│       └── configurationItemsSlice.js    # CIs state
│
└── utils/
    └── cmplan/
        ├── mockCMPlanData.js             # Complete mock dataset
        ├── mockCMPlanApi.js              # Mock API functions (async, delay)
        └── cmplanConstants.js            # Enums, labels, colors
```

---

## 2. State Management (Redux Toolkit)

### Slice: `ciClasses`
```js
state: {
  items: [],        // CIClass[]
  loading: false,
  error: null,
}
// Async thunks: fetchCIClasses, createCIClass, updateCIClass, deleteCIClass
```

### Slice: `attributeDefinitions`
```js
state: {
  items: [],             // AttributeDefinition[]
  loading: false,
  error: null,
  activeClassId: null,   // Filter UI state
}
// Async thunks: fetchAttributeDefinitions, createAttrDef, updateAttrDef, deleteAttrDef
```

### Slice: `configurationItems`
```js
state: {
  items: [],             // ConfigurationItem[]
  total: 0,
  loading: false,
  error: null,
  filters: {
    classId: null,
    status: null,
    criticality: null,
    environment: null,
    search: '',
  },
  pagination: { page: 1, pageSize: 20 },
  selectedId: null,
}
// Async thunks: fetchCIs, createCI, updateCI, deleteCI, fetchCIDetail
```

### Root Store composition
```js
// store/index.js
combineReducers({
  cmplan: {
    ciClasses,
    attributeDefinitions,
    configurationItems,
  },
  // ...existing slices
})
```

---

## 3. Component Interaction Flow

### Attribute Settings Page
```
AttributeSettingsPage
  └── CIClassTabs (tab per class)
        └── AttributeDefinitionTable
              ├── [Add Attribute] → AttributeFormModal (create mode)
              └── [Edit] row   → AttributeFormModal (edit mode)
                                  └── dispatch(createAttrDef / updateAttrDef)
```

### Configuration Items Page
```
ConfigurationItemsPage
  ├── CIFilterBar → dispatch(setFilters) → refetch
  ├── CITable
  │     ├── [Add CI] → CIFormModal (create)
  │     ├── [Edit] row → CIFormModal (edit)
  │     └── [View] row → CIDetailDrawer
  └── CIFormModal
        └── CIDynamicFields (renders from attributeDefinitions by classId)
```

---

## 4. Dynamic Form Rendering

When a user selects a CI Class in the Add/Edit CI form, the system:
1. Filters `attributeDefinitions` by `ciClassId` + global (ciClassId === null)
2. Sorts by `sort_order`
3. Renders each attribute as the appropriate AntD form field based on `type`

**Type → Form Control mapping:**
| Type         | AntD Component       |
|--------------|----------------------|
| text         | Input                |
| number       | InputNumber          |
| date         | DatePicker           |
| datetime     | DatePicker showTime  |
| select       | Select               |
| multiselect  | Select mode="multiple"|
| checkbox     | Checkbox             |
| textarea     | Input.TextArea       |
| url          | Input (type=url)     |
| email        | Input (type=email)   |
| ip_address   | Input + IP validation|

---

## 5. Mock API Layer

All API calls are routed through mock functions that simulate:
- Network latency (200–600ms delay via `setTimeout`)
- RESTful response shape: `{ data, total, page, pageSize, success }`
- Error simulation flag for testing

**Convention:**
```js
// mockCMPlanApi.js
export const cmplanApi = {
  ciClasses: { getAll, create, update, remove },
  attributeDefinitions: { getAll, create, update, remove },
  configurationItems: { getAll, getById, create, update, remove },
  relationships: { getByCI, create, remove },
  compliance: { getSummary, getByCI },
}
```

---

## 6. Routing

```
/cmplan/dashboard               → CMPlanDashboardPage
/cmplan/attribute-settings      → AttributeSettingsPage
/cmplan/configuration-items     → ConfigurationItemsPage
```

---

## 7. Design System Conventions (AntD v3)

- Use AntD v3 `Form.create()` HOC → props.form for modals
- `Table` with `rowKey="id"`, `scroll={{ x: true }}`
- `Modal` with `destroyOnClose`
- Colors from AntD token: primary `#1890ff`, success `#52c41a`, warning `#faad14`, error `#f5222d`
- Consistent card layout: `Card` with `bodyStyle={{ padding: '16px 24px' }}`
- Loading states: `Spin` overlay on content area

---

## 8. Performance Considerations

- Memoize selectors with `reselect` (createSelector)  
- `React.memo` on pure table row components  
- Paginated CI Table (server-side): avoid fetching all CIs at once  
- Attribute definitions cached in Redux, invalidated on mutations  
- Form fields rendered with `React.useMemo` on class change  

---

## 9. Extensibility Guide

### Adding a new CI Class
1. Insert row in `ci_classes`
2. Define attribute definitions for the new class via Attribute Settings UI
3. No frontend code changes required — CI form renders dynamically

### Adding a new attribute type
1. Add enum value to `attribute_definitions.type`
2. Add case in `CIDynamicFields.jsx` type-to-component map
3. Add case in `AttributeFormModal.jsx` type selector options
