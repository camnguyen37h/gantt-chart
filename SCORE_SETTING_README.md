# Score Setting Feature - Documentation

## Overview
Score Setting is a comprehensive feature for managing role-based scoring systems with validation, pagination, and CRUD operations.

## Features

### 1. **Role Management with Pagination**
- Loads all roles on initial page load
- Supports pagination with configurable items per page (default: 5 roles per page)
- Clean navigation between pages with Previous/Next buttons and page numbers

### 2. **Collapsible Role Sections**
- Each role has a collapsible section
- Click on role header to expand/collapse
- Shows toggle icon (▶/▼) to indicate state
- Only loads score form when expanded (performance optimization)

### 3. **Score Management**
- Display scores in a table format with columns:
  - **Score**: The score name/level (e.g., N/A, L0, L1, Junior, Senior)
  - **Base Score**: Numeric value for the score
  - **Status**: Checkbox for active/inactive status
  - **Định nghĩa**: Vietnamese definition/description
  - **Hành động**: Action buttons (delete)

### 4. **Validation Rules**

#### Required Fields
- All fields are required: Score, Base Score, and Definition
- Empty fields will show error messages

#### N/A Mandatory
- **Critical Rule**: At least one record with Score = "N/A" must exist
- Cannot delete the N/A record
- Warning shown if trying to save without N/A

#### Duplicate Check
- Score names must be unique within a role
- Case-insensitive comparison
- Shows error on all duplicate entries

#### Length Validation
- **Score**: Maximum 20 characters
- **Definition**: Minimum 10 characters, Maximum 500 characters

#### Number Validation
- **Base Score**: Must be a valid number

### 5. **Add/Delete Rows**
- **Add Row**: Click "+ Thêm dòng" button to add new score entry
- **Delete Row**: Click trash icon to remove a row
  - Cannot delete if only one row remains
  - Cannot delete N/A row (protected)
  - Shows confirmation/warning messages

### 6. **Save Functionality**
- Click "Save" button to validate and save scores
- Validates all entries before saving
- Shows error messages for invalid fields
- Success message on successful save

## File Structure

```
src/
├── pages/
│   ├── ScoreSetting.jsx          # Main page component
│   └── ScoreSetting.css          # Page styles
├── components/
│   └── ScoreForm/
│       ├── ScoreForm.jsx         # Score table form component
│       └── ScoreForm.css         # Form styles
└── utils/
    ├── scoreSettingApi.js        # Mock API for data fetching
    └── scoreValidation.js        # Validation utilities
```

## Component Details

### ScoreSetting.jsx (Main Component)
- Manages role list state
- Handles pagination logic
- Controls expand/collapse state for each role
- Coordinates data loading and saving

### ScoreForm.jsx (Form Component)
- Renders score table for a specific role
- Handles form input changes
- Manages add/delete row operations
- Performs validation before save
- Displays validation errors inline

### scoreValidation.js (Utilities)
- `validateScores(scores)`: Validates entire score array
- `validateField(field, value, allScores, currentIndex)`: Validates single field
- `isScoreNameUnique(scoreName, currentIndex, scores)`: Checks for duplicates
- Constants for validation rules

### scoreSettingApi.js (Mock API)
- `fetchRolesWithScores()`: Returns all roles with scores
- `saveRoleScores(roleId, scores)`: Saves scores for a role
- `fetchRoleById(roleId)`: Gets single role
- `getRolesCount()`: Returns total role count
- Mock database with 7 roles (PM, QA, Developer, Tester, Test Lead, BA, Designer)

## Usage Example

```jsx
import ScoreSetting from './pages/ScoreSetting';

function App() {
  return (
    <div className="App">
      <ScoreSetting />
    </div>
  );
}
```

## Validation Error Messages

| Validation | Error Message |
|------------|---------------|
| Empty Score | "Score là bắt buộc!" |
| Score Too Long | "Score không được vượt quá 20 ký tự!" |
| Duplicate Score | "Score 'XXX' bị trùng lặp!" |
| Empty Base Score | "Base Score là bắt buộc!" |
| Invalid Number | "Base Score phải là số!" |
| Empty Definition | "Định nghĩa là bắt buộc!" |
| Definition Too Short | "Định nghĩa phải có ít nhất 10 ký tự!" |
| Definition Too Long | "Định nghĩa không được vượt quá 500 ký tự!" |
| No N/A Record | "Bắt buộc phải có một bản ghi với Score là 'N/A'!" |

## Data Structure

### Role Object
```javascript
{
  id: number,
  name: string,
  scores: Score[]
}
```

### Score Object
```javascript
{
  id: number,
  score: string,          // e.g., "N/A", "L0", "Junior"
  baseScore: number,      // Numeric value
  status: boolean,        // Active/inactive
  definition: string      // Description in Vietnamese
}
```

## Configuration

### Pagination
Change `ITEMS_PER_PAGE` constant in ScoreSetting.jsx:
```javascript
const ITEMS_PER_PAGE = 5; // Adjust as needed
```

### Validation Rules
Modify constants in scoreValidation.js:
```javascript
export const VALIDATION_RULES = {
  SCORE_MAX_LENGTH: 20,
  DEFINITION_MAX_LENGTH: 500,
  DEFINITION_MIN_LENGTH: 10,
  REQUIRED_SCORE: 'N/A'
};
```

## Mock Data
The system includes 7 pre-configured roles:
1. **PM** - 6 levels (N/A, L0-L4)
2. **QA** - 4 levels (N/A, Junior, Middle, Senior)
3. **Developer** - 6 levels (N/A, Intern, Fresher, Junior, Middle, Senior)
4. **Tester** - 3 levels (N/A, Manual, Automation)
5. **Test Lead** - 3 levels (N/A, Junior Lead, Senior Lead)
6. **Business Analyst** - 3 levels (N/A, Junior BA, Senior BA)
7. **Designer** - 4 levels (N/A, UI, UX, UI/UX)

## Styling Features
- Responsive table layout
- Hover effects on rows and buttons
- Error state styling (red borders, pink background)
- Disabled state for protected actions
- Clean, modern UI with proper spacing
- Mobile-responsive with horizontal scroll

## Future Enhancements
- Real API integration (replace mock API)
- Bulk operations (delete multiple rows)
- Import/Export functionality
- Search and filter roles
- Role creation and deletion
- Audit log for changes
- Undo/Redo functionality
- Drag and drop row reordering

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (uses modern JavaScript features)
