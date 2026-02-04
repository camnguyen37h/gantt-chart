# Score Setting - Visual Structure Guide

## 📱 UI Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      Score Setting                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ PM                                                  │  │ ← Collapsed Role
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▼ QA                                                  │  │ ← Expanded Role
│  ├──────────────────────────────────────────────────────┤  │
│  │  [+ Thêm dòng]                         [Save]        │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Score │ Base Score │ Status │ Định nghĩa │ 🗑️  │ │  │
│  │  ├───────┼────────────┼────────┼────────────┼─────┤ │  │
│  │  │  N/A  │     0      │   ☑    │ Điểm 0...  │ 🚫  │ │  │
│  │  │ Junior│     1      │   ☑    │ Điểm 1...  │ 🗑️  │ │  │
│  │  │ Middle│     2      │   ☐    │ Điểm 2...  │ 🗑️  │ │  │
│  │  │ Senior│     3      │   ☑    │ Điểm 3...  │ 🗑️  │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ Developer                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ Tester                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ▶ Test Lead                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [Previous]  [1] [2]  [Next]                          │  │ ← Pagination
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────────┐
│  ScoreSetting   │ ← Main Container
│  Component      │
└────────┬────────┘
         │
         ├─── fetchRolesWithScores() ──→ scoreSettingApi.js
         │                                      │
         │                                      ↓
         │                              [Mock Database]
         │                                      │
         │    ←─────── roles data ──────────────┘
         │
         ├─── Pagination Logic
         │    • currentPage state
         │    • paginatedRoles calculation
         │
         ├─── Collapse/Expand Logic
         │    • expandedRoles state
         │    • toggleRole()
         │
         └─── Render ScoreForm
                     │
                     ↓
         ┌───────────────────┐
         │    ScoreForm      │
         │   Component       │
         └─────────┬─────────┘
                   │
                   ├─── Display scores table
                   │
                   ├─── Handle input changes
                   │
                   ├─── Add/Delete rows
                   │
                   ├─── Validate on save
                   │    │
                   │    └──→ scoreValidation.js
                   │              │
                   │              ├─ Check required fields
                   │              ├─ Check duplicates
                   │              ├─ Check lengths
                   │              └─ Check N/A exists
                   │
                   └─── Save scores
                        │
                        └──→ onSave() callback
                              │
                              └──→ Update parent state
```

## 🎯 Component Hierarchy

```
ScoreSetting.jsx
│
├─── State
│    ├── roles: []
│    ├── currentPage: 1
│    ├── expandedRoles: {}
│    └── loading: true
│
├─── Effects
│    └── useEffect(() => loadRoles(), [])
│
├─── Functions
│    ├── loadRoles()
│    ├── toggleRole(roleId)
│    ├── handleSaveScores(roleId, scores)
│    └── goToPage(page)
│
└─── Render
     ├── Role Items (paginatedRoles.map)
     │    ├── Role Header (collapsible)
     │    └── Role Content (conditional)
     │         └── ScoreForm Component
     │              ├── Props
     │              │    ├── roleId
     │              │    ├── roleName
     │              │    ├── initialScores
     │              │    └── onSave
     │              │
     │              ├── State
     │              │    ├── scores: []
     │              │    └── errors: {}
     │              │
     │              ├── Functions
     │              │    ├── handleInputChange()
     │              │    ├── handleCheckboxChange()
     │              │    ├── handleAddRow()
     │              │    ├── handleDeleteRow()
     │              │    └── handleSave()
     │              │
     │              └── Render
     │                   ├── Add Row Button
     │                   ├── Save Button
     │                   ├── Score Table
     │                   │    └── Rows (scores.map)
     │                   │         ├── Score Input
     │                   │         ├── Base Score Input
     │                   │         ├── Status Checkbox
     │                   │         ├── Definition Input
     │                   │         └── Delete Button
     │                   └── Error Messages
     │
     └── Pagination Controls
```

## 🛠️ Validation Flow

```
User clicks [Save]
        │
        ↓
handleSave()
        │
        ↓
validateScores(scores) ──→ scoreValidation.js
        │                          │
        │                          ├─ Check N/A exists?
        │                          │   No → errors.general
        │                          │
        │                          ├─ For each score:
        │                          │   │
        │                          │   ├─ Score empty?
        │                          │   │   Yes → errors[index-score]
        │                          │   │
        │                          │   ├─ Score too long?
        │                          │   │   Yes → errors[index-score]
        │                          │   │
        │                          │   ├─ Base Score empty?
        │                          │   │   Yes → errors[index-baseScore]
        │                          │   │
        │                          │   ├─ Base Score not number?
        │                          │   │   Yes → errors[index-baseScore]
        │                          │   │
        │                          │   ├─ Definition empty?
        │                          │   │   Yes → errors[index-definition]
        │                          │   │
        │                          │   ├─ Definition too short?
        │                          │   │   Yes → errors[index-definition]
        │                          │   │
        │                          │   └─ Definition too long?
        │                          │       Yes → errors[index-definition]
        │                          │
        │                          └─ Check duplicates
        │                              Found → errors[index-score]
        │
        ↓
{ isValid, errors }
        │
        ├─ isValid = false
        │   │
        │   ├─ setErrors(errors)
        │   ├─ Alert user
        │   └─ Return
        │
        └─ isValid = true
            │
            ├─ Clear errors
            ├─ onSave(scores)
            └─ Show success message
```

## 📦 File Dependencies

```
ScoreSetting.jsx
    │
    ├─── imports
    │    ├── React
    │    ├── './ScoreSetting.css'
    │    ├── ScoreForm from '../components/ScoreForm/ScoreForm'
    │    └── fetchRolesWithScores from '../utils/scoreSettingApi'
    │
    └─── uses
         └── ScoreForm component

ScoreForm.jsx
    │
    ├─── imports
    │    ├── React
    │    ├── './ScoreForm.css'
    │    └── validateScores from '../../utils/scoreValidation'
    │
    └─── uses
         └── validateScores function

scoreValidation.js
    │
    ├─── exports
    │    ├── VALIDATION_RULES (constants)
    │    ├── validateScores(scores)
    │    ├── isScoreNameUnique(scoreName, index, scores)
    │    └── validateField(field, value, allScores, index)
    │
    └─── used by
         └── ScoreForm.jsx

scoreSettingApi.js
    │
    ├─── exports
    │    ├── fetchRolesWithScores()
    │    ├── saveRoleScores(roleId, scores)
    │    ├── fetchRoleById(roleId)
    │    └── getRolesCount()
    │
    └─── used by
         └── ScoreSetting.jsx
```

## 🎨 CSS Structure

```
ScoreSetting.css
    ├── .score-setting-container
    ├── .score-setting-title
    ├── .score-setting-loading
    ├── .roles-list
    ├── .role-item
    ├── .role-header (with hover)
    ├── .role-toggle-icon
    ├── .role-name
    ├── .role-content
    └── .pagination
         ├── .pagination-btn
         ├── .pagination-pages
         └── .pagination-page (with .active state)

ScoreForm.css
    ├── .score-form
    ├── .score-form-header
    ├── .btn-add-row
    ├── .btn-save
    ├── .score-table-wrapper
    ├── .score-table
    │    ├── thead
    │    ├── th
    │    ├── td
    │    ├── .td-center
    │    └── tr:hover
    ├── .score-input (with .error state)
    ├── .score-checkbox
    ├── .btn-delete
    ├── .error-message
    ├── .general-error-message
    └── @media (max-width: 768px)
```

## 🔐 Security & Best Practices

```
✅ Input Validation
   ├── Client-side validation (immediate feedback)
   └── Should add server-side validation in real API

✅ XSS Prevention
   ├── React automatically escapes content
   └── No dangerouslySetInnerHTML used

✅ State Management
   ├── Immutable updates (spread operators)
   └── No direct state mutations

✅ Performance
   ├── Conditional rendering (only expand when needed)
   ├── Pagination (limits DOM nodes)
   └── useEffect with dependencies

✅ Error Handling
   ├── Try-catch in async functions
   ├── User-friendly error messages
   └── Graceful degradation

✅ Code Quality
   ├── Consistent naming conventions
   ├── Separated concerns (components, utils, api)
   ├── Reusable validation functions
   └── Well-commented code
```
