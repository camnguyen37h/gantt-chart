# Business Plan Feature - Documentation

## Overview
Business Plan is a comprehensive workforce planning and resource management system with multi-view filtering, approval workflows, and role-based access control. It enables project managers to plan, track, and manage onsite and offshore resources across multiple projects.

## Features

### 1. **View Mode System**
- **Global View Mode Filter**: Affects all data across all tabs simultaneously
- **4 View Modes**:
  - **Total**: Shows all resources (onsite + offshore combined)
  - **OB (Onsite/Offshore Breakdown)**: Shows onsite and offshore as separate rows
  - **Onsite**: Filters to show only onsite resources
  - **Offshore**: Filters to show only offshore resources
- Toggle between modes using dropdown selector
- Persists selection across page refreshes

### 2. **Tab-Based Navigation**
- **Multiple Project Tabs**: Each tab represents a different project
- **Lazy Loading**: Tab content loads only when activated
- **Destroy Inactive Tabs**: Unmounts inactive tabs to optimize performance
- **Tab Switching**: Preserves view mode when switching between tabs
- **Add/Remove Tabs**: Dynamic tab management for projects

### 3. **Resource Planning Table**
- Display resources in table format with columns:
  - **Tên nhân sự**: Resource name with role badge
  - **Level**: Skill level (Junior, Middle, Senior, etc.)
  - **Effort (MD)**: Man-days allocated
  - **Start Date**: Resource assignment start
  - **End Date**: Resource assignment end
  - **Location**: Onsite/Offshore indicator
  - **Actions**: Edit/Delete buttons

### 4. **Combined MVV Approval**
- **Multi-Value Validation**: Approve multiple items in a single transaction
- **Promise.all() Pattern**: Ensures all-or-nothing approval
- **Approval States**:
  - **Draft**: Editable, not submitted
  - **Pending**: Awaiting approval
  - **Approved**: Locked, read-only
  - **Rejected**: Returned for revision
- **Transaction Rollback**: If any approval fails, all revert
- **Success/Failure Notifications**: Clear feedback for all operations

### 5. **Permission-Based Access Control**
- **Role-Based Permissions**: Different actions for different user roles
  - **Admin**: Full CRUD + approval rights
  - **Manager**: Create, edit own projects + view others
  - **Member**: View only, no edit rights
- **Permission Guards**: UI elements disabled based on permissions
- **Dynamic Button States**: Edit/Delete/Approve buttons show/hide based on role
- **Approval Permissions**: Separate permissions for submitting vs approving

### 6. **Data Filtering & Calculation**
- **View Mode Filtering**: Automatically filters data based on selected view mode
- **Total Calculations**: Aggregate man-days, costs across filtered resources
- **Onsite/Offshore Split**: Separate calculations for each location type
- **Real-time Updates**: Calculations update immediately on data change
- **Export with Filters**: Export respects current view mode selection

### 7. **HTML Preview & Print Export**
- **Collapsible Preview Panel**: Click to expand/collapse preview section
  - Panel header shows "Preview" with toggle icon (▶/▼)
  - Click header to expand and generate HTML preview
  - Click again to collapse and hide preview
- **Live HTML Preview**: Renders formatted HTML preview of current data
  - Shows data exactly as it will appear when printed
  - Respects current view mode (Total/OB/Onsite/Offshore)
  - Includes all selected filters and calculations
  - Formatted tables with proper styling and borders
  - Company logo and header information
  - Summary totals and statistics
  - Page break indicators for print layout
- **Browser Print Preview**: Opens native browser print dialog
  - Click "Print" button to trigger window.print()
  - Opens browser's built-in print preview
  - Allows page setup configuration (margins, orientation)
  - Print to PDF option available in browser
  - Print to physical printer option
- **Print-Optimized Styling**: CSS optimized for print media
  - @media print rules for clean print output
  - Hides UI elements (buttons, navigation) when printing
  - Adjusts colors for grayscale printing
  - Optimizes font sizes for readability
  - Proper page breaks between sections
- **Preview Customization**:
  - Toggle company logo visibility
  - Include/exclude summary section
  - Show/hide column headers
  - Adjust table borders and spacing
  - Select page orientation (Portrait/Landscape)
- **Real-time Updates**: Preview regenerates when data changes
  - Auto-refresh on view mode change
  - Update when filters applied
  - Refresh on data edit

## File Structure

```
src/
├── pages/
│   ├── BusinessPlan.jsx              # Main page component
│   └── BusinessPlan.css              # Page styles
├── components/
│   ├── BusinessPlanTabs/
│   │   ├── ProjectTab.jsx            # Individual project tab
│   │   └── ProjectTab.css            # Tab styles
│   ├── ResourceTable/
│   │   ├── ResourceTable.jsx         # Resource planning table
│   │   └── ResourceTable.css         # Table styles
│   ├── ViewModeSelector/
│   │   ├── ViewModeSelector.jsx      # View mode dropdown
│   │   └── ViewModeSelector.css      # Selector styles
│   ├── ApprovalPanel/
│   │   ├── ApprovalPanel.jsx         # Approval workflow UI
│   │   └── ApprovalPanel.css         # Panel styles
│   └── PreviewPanel/
│       ├── PreviewPanel.jsx          # Collapsible preview container
│       ├── PreviewPanel.css          # Preview panel styles
│       ├── HTMLPreview.jsx           # HTML preview renderer
│       ├── PrintPreview.css          # Print-specific styles (@media print)
│       └── PreviewControls.jsx       # Preview customization options
└── utils/
    ├── businessPlanApi.js            # API calls for business plan
    ├── viewModeFilter.js             # View mode filtering logic
    ├── approvalWorkflow.js           # Approval transaction handling
    ├── permissionGuards.js           # RBAC permission checks
    ├── htmlGenerator.js              # Generate HTML preview from data
    └── printFormatter.js             # Format data for print output
```

## Component Details

### BusinessPlan.jsx (Main Component)
- Manages global view mode state
- Coordinates tab switching and data loading
- Handles approval workflow initiation
- Enforces permission-based UI rendering

### ProjectTab.jsx (Tab Component)
- Renders resource table for specific project
- Applies view mode filtering to project data
- Manages local editing state
- Triggers save/submit operations

### ResourceTable.jsx (Table Component)
- Displays filtered resource list
- Handles inline editing of resources
- Calculates totals for displayed resources
- Manages add/delete row operations

### ViewModeSelector.jsx (Filter Component)
- Dropdown selector for 4 view modes
- Updates global state on selection change
- Highlights current active mode
- Persists selection to localStorage

### ApprovalPanel.jsx (Workflow Component)
- Displays current approval state
- Shows approval history/timeline
- Provides submit/approve/reject actions
- Handles transaction-based approval with Promise.all()

### PreviewPanel.jsx (Preview Container)
- Collapsible panel component
- Click header to toggle expand/collapse
- Shows toggle icon (▶ collapsed / ▼ expanded)
- Manages preview generation state
- Lazy loads preview content on first expand
- Re-generates preview when data changes
- Provides "Print" button to trigger window.print()

### HTMLPreview.jsx (Preview Renderer)
- Renders formatted HTML from current data
- Applies view mode filtering to preview
- Displays company header with logo
- Renders resource table with styling
- Shows summary section with totals
- Calculates and displays statistics
- Applies print-optimized CSS classes
- Supports custom preview templates

### PreviewControls.jsx (Customization Options)
- Toggle company logo checkbox
- Include/exclude summary checkbox
- Show/hide headers checkbox
- Page orientation selector (Portrait/Landscape)
- Table border style options
- Font size adjustment slider
- Refresh preview button

### viewModeFilter.js (Utilities)
- `filterByViewMode(data, viewMode)`: Filters resources based on mode
- `getOnsiteData(data)`: Extracts onsite resources only
- `getOffshoreData(data)`: Extracts offshore resources only
- `splitOnsiteOffshore(data)`: Splits into separate rows for OB mode
- `mergeOnsiteOffshore(data)`: Combines into single row for Total mode

### approvalWorkflow.js (Utilities)
- `submitForApproval(projectIds)`: Submits multiple projects
- `approveProjects(projectIds)`: Approves using Promise.all() transaction
- `rejectProjects(projectIds, reason)`: Rejects with reason
- `rollbackTransaction(transactionId)`: Reverts failed approval
- `getApprovalStatus(projectId)`: Gets current state

### permissionGuards.js (Utilities)
- `canEdit(user, project)`: Check edit permission
- `canDelete(user, resource)`: Check delete permission
- `canSubmit(user, project)`: Check submit permission
- `canApprove(user, project)`: Check approval permission
- `hasRole(user, roles)`: Role membership check

### htmlGenerator.js (HTML Preview Utilities)
- `generatePreviewHTML(data, options)`: Creates formatted HTML preview
- `createTableHTML(resources, columns)`: Generates HTML table from data
- `addCompanyHeader(html, logo, title)`: Inserts company header section
- `addSummarySection(html, totals)`: Appends summary statistics
- `applyViewModeToPreview(data, viewMode)`: Filters data for preview
- `formatResourceRow(resource, viewMode)`: Formats single resource as HTML row
- `calculatePreviewTotals(data)`: Computes totals for summary
- `addPageBreaks(html, rowsPerPage)`: Inserts page break markers
- `sanitizeHTMLContent(content)`: Escapes HTML special characters

### printFormatter.js (Print Utilities)
- `formatForPrint(html, options)`: Prepares HTML for printing
- `applyPrintStyles(html)`: Adds print-specific CSS
- `hideUIElements()`: Hides buttons/navigation for print
- `showUIElements()`: Restores UI after print
- `setPageOrientation(orientation)`: Applies portrait/landscape
- `adjustForGrayscale(html)`: Optimizes colors for B&W printing
- `addPrintCSS()`: Injects @media print stylesheet
- `removePrintCSS()`: Removes injected print styles
- `triggerBrowserPrint()`: Calls window.print() with preparation

### businessPlanApi.js (API Layer)
- `fetchProjects()`: Returns all projects for user
- `fetchProjectById(projectId)`: Gets single project with resources
- `saveProject(projectId, data)`: Saves project data
- `submitForApproval(projectId)`: Submits for approval workflow
- `approveProject(projectId)`: Approves a project
- `rejectProject(projectId, reason)`: Rejects a project

## Usage Example

```jsx
import BusinessPlan from './pages/BusinessPlan';

function App() {
  const currentUser = {
    id: 1,
    name: 'John Doe',
    role: 'manager',
    permissions: ['view', 'edit', 'submit']
  };

  return (
    <div className="App">
      <BusinessPlan user={currentUser} />
    </div>
  );
}
```

## View Mode Behavior

| View Mode | Display Behavior | Calculation |
|-----------|-----------------|-------------|
| **Total** | Single row per resource (combined onsite + offshore) | Sum of all man-days |
| **OB** | Two rows per resource (onsite row + offshore row) | Separate totals for each |
| **Onsite** | Only onsite resources visible | Onsite man-days only |
| **Offshore** | Only offshore resources visible | Offshore man-days only |

## Approval States

| State | Description | Available Actions |
|-------|-------------|-------------------|
| **Draft** | Initial editable state | Edit, Delete, Submit |
| **Pending** | Awaiting approval | View, Approve, Reject |
| **Approved** | Finalized and locked | View only |
| **Rejected** | Returned for changes | Edit, Resubmit |

## Permission Matrix

| Role | View | Create | Edit | Delete | Submit | Approve |
|------|------|--------|------|--------|--------|---------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ Own | ✅ Own | ✅ | ❌ |
| **Member** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Data Structure

### Project Object
```javascript
{
  id: number,
  name: string,
  status: 'draft' | 'pending' | 'approved' | 'rejected',
  resources: Resource[],
  totalManDays: number,
  onsiteManDays: number,
  offshoreManDays: number,
  createdBy: number,
  approvedBy: number | null,
  approvalDate: string | null
}
```

### Resource Object
```javascript
{
  id: number,
  name: string,
  role: string,              // e.g., "Developer", "Tester"
  level: string,             // e.g., "Junior", "Senior"
  manDays: number,           // Total effort in man-days
  onsiteManDays: number,     // Onsite portion
  offshoreManDays: number,   // Offshore portion
  startDate: string,         // ISO date format
  endDate: string,           // ISO date format
  location: 'onsite' | 'offshore' | 'mixed'
}
```

### User Object
```javascript
{
  id: number,
  name: string,
  email: string,
  role: 'admin' | 'manager' | 'member',
  permissions: string[]      // e.g., ['view', 'edit', 'approve']
}
```

### PreviewOptions Object
```javascript
{
  orientation: 'portrait' | 'landscape',
  showLogo: boolean,
  showSummary: boolean,
  showHeaders: boolean,
  fontSize: number,          // Font size in points
  tableBorder: string,       // CSS border style
  includePageBreaks: boolean,
  rowsPerPage: number        // For automatic page breaks
}
```

## Configuration

### View Mode Persistence
Change storage key in ViewModeSelector.jsx:
```javascript
const STORAGE_KEY = 'businessPlan_viewMode'; // Adjust as needed
```

### Approval Transaction Timeout
Modify timeout in approvalWorkflow.js:
```javascript
const APPROVAL_TIMEOUT = 30000; // 30 seconds, adjust as needed
```

### Permission Definitions
Update permission mappings in permissionGuards.js:
```javascript
export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  SUBMIT: 'submit',
  APPROVE: 'approve'
};

export const ROLE_PERMISSIONS = {
  admin: ['view', 'create', 'edit', 'delete', 'submit', 'approve'],
  manager: ['view', 'create', 'edit', 'delete', 'submit'],
  member: ['view']
};
```

### Preview Panel Configuration
Customize preview options in PreviewPanel.jsx:
```javascript
export const PREVIEW_OPTIONS = {
  DEFAULT_ORIENTATION: 'portrait',     // 'portrait' or 'landscape'
  ROWS_PER_PAGE: 25,                   // Number of rows per page for breaks
  SHOW_LOGO: true,                     // Show company logo by default
  SHOW_SUMMARY: true,                  // Include summary section
  SHOW_HEADERS: true,                  // Show column headers
  FONT_SIZE: 12,                       // Default font size in pt
  TABLE_BORDER: '1px solid #ddd',      // Table border style
  AUTO_REFRESH: true                   // Auto-refresh on data change
};
```

### Print Media Query
Customize print styles in PrintPreview.css:
```css
@media print {
  /* Hide UI elements */
  .no-print, button, .sidebar, .header {
    display: none !important;
  }
  
  /* Page setup */
  @page {
    size: A4 portrait;
    margin: 2cm;
  }
  
  /* Optimize for print */
  body {
    font-size: 10pt;
    color: #000;
  }
  
  /* Page breaks */
  .page-break {
    page-break-after: always;
  }
  
  /* Table styling */
  table {
    border-collapse: collapse;
    width: 100%;
  }
}
```

## Mock Data
The system includes 3 pre-configured projects:

### Project 1: "Web Portal Redesign"
- 5 resources (3 onsite, 2 offshore)
- Status: Draft
- Total: 120 man-days (80 onsite, 40 offshore)

### Project 2: "Mobile App Development"
- 8 resources (4 onsite, 4 offshore)
- Status: Pending Approval
- Total: 240 man-days (120 onsite, 120 offshore)

### Project 3: "Data Migration"
- 3 resources (1 onsite, 2 offshore)
- Status: Approved
- Total: 90 man-days (30 onsite, 60 offshore)

## Styling Features
- Responsive table layout with horizontal scroll
- View mode badge indicators (colored pills)
- Approval state color coding:
  - Draft: Gray
  - Pending: Orange
  - Approved: Green
  - Rejected: Red
- Disabled state styling for locked records
- Loading states for async operations
- Smooth transitions between view modes
- Mobile-responsive with touch-friendly controls

## Validation Rules

### Resource Validation
- **Name**: Required, max 100 characters
- **Role**: Required, must be from predefined list
- **Level**: Required, must match role's available levels
- **Man-Days**: Required, must be positive number
- **Dates**: Required, end date must be after start date
- **Location Split**: Onsite + Offshore must equal Total

### Approval Validation
- **Submit**: All resources must be valid
- **Approve**: User must have approval permission
- **Reject**: Reason required (min 10 characters)
- **Transaction**: All projects in batch must pass validation

### Preview Validation
- **Data Required**: Cannot generate preview with empty data
- **View Mode**: Must have valid view mode selected
- **Font Size**: Must be between 8pt and 16pt
- **Rows Per Page**: Must be positive number (min 10, max 100)
- **Logo URL**: Must be valid image URL if logo enabled

## Error Messages

| Validation | Error Message |
|------------|---------------|
| Missing Resource Name | "Tên nhân sự là bắt buộc!" |
| Invalid Man-Days | "Effort phải là số dương!" |
| Date Range Error | "Ngày kết thúc phải sau ngày bắt đầu!" |
| Location Split Mismatch | "Tổng onsite + offshore phải bằng tổng effort!" |
| No Approval Permission | "Bạn không có quyền phê duyệt!" |
| Transaction Failed | "Phê duyệt thất bại, đã rollback tất cả thay đổi!" |
| Concurrent Edit | "Dữ liệu đã bị thay đổi bởi người khác!" |
| Empty Preview Data | "Không có dữ liệu để hiển thị preview!" |
| Invalid Font Size | "Font size phải từ 8pt đến 16pt!" |
| Logo Load Failed | "Không thể tải logo! Kiểm tra lại URL." |
| Print Failed | "In thất bại! Vui lòng thử lại." |
| Preview Generation Error | "Lỗi tạo preview! Kiểm tra lại dữ liệu." |

## Advanced Features

### 1. **Concurrent Editing Protection**
- Optimistic locking with version numbers
- Conflict detection on save
- Auto-refresh on conflict detection
- Warning messages for data staleness

### 2. **HTML Preview & Print**
- Collapsible preview panel with expand/collapse
- Live HTML preview generation from current data
- Real-time preview updates on data/filter changes
- Browser print dialog with window.print()
- Print to PDF option via browser
- Print-optimized CSS with @media print rules
- Customizable preview options (logo, summary, headers)
- Page orientation selection (Portrait/Landscape)
- Automatic page breaks for multi-page documents
- Print preview shows exact print output
- Grayscale optimization for B&W printers

### 3. **Audit Trail**
- Track all changes with timestamp
- Record user who made changes
- View approval history
- Export audit logs

### 4. **Bulk Operations**
- Select multiple resources for batch actions
- Bulk delete with confirmation
- Bulk location change
- Bulk date adjustments

### 5. **Search and Filter**
- Search by resource name or role
- Filter by skill level
- Filter by date range
- Filter by location

## Performance Optimizations
- **Lazy Loading**: Only active tab data loaded
- **Memoization**: Expensive calculations cached with useMemo
- **Debounced Search**: 300ms delay on search input
- **Virtual Scrolling**: For tables with 100+ rows
- **Code Splitting**: Lazy load approval modal
- **Tab Destruction**: Inactive tabs unmounted to free memory
- **Preview Lazy Generation**: Preview HTML only generated when panel expanded
- **Debounced Preview Refresh**: 500ms delay on data changes before regenerating
- **Print CSS Injection**: Print styles only loaded when needed, removed after print
- **Image Preloading**: Company logo preloaded for smooth preview

## Integration Points

### API Endpoints
```
GET    /api/business-plan/projects          # Get all projects
GET    /api/business-plan/projects/:id      # Get single project
POST   /api/business-plan/projects          # Create project
PUT    /api/business-plan/projects/:id      # Update project
DELETE /api/business-plan/projects/:id      # Delete project
POST   /api/business-plan/submit            # Submit for approval
POST   /api/business-plan/approve           # Approve projects
POST   /api/business-plan/reject            # Reject projects
GET    /api/business-plan/audit/:id         # Get audit trail
```

### Event Emitters
```javascript
// Subscribe to approval events
businessPlanEvents.on('approval:success', (projectIds) => {
  // Refresh data, show notification
});

businessPlanEvents.on('approval:failed', (error) => {
  // Show error, rollback UI changes
});

businessPlanEvents.on('viewMode:changed', (newMode) => {
  // Update charts, recalculate totals
});

businessPlanEvents.on('preview:expanded', () => {
  // Generate HTML preview, show loading state
});

businessPlanEvents.on('preview:collapsed', () => {
  // Clear preview HTML to free memory
});

businessPlanEvents.on('preview:generated', (html) => {
  // Display preview, hide loading state
});

businessPlanEvents.on('preview:failed', (error) => {
  // Show error message
});

businessPlanEvents.on('print:started', () => {
  // Hide UI elements, apply print styles
});

businessPlanEvents.on('print:completed', () => {
  // Restore UI elements, remove print styles
});

businessPlanEvents.on('print:cancelled', () => {
  // Cleanup, restore normal state
});
```

## Testing Scenarios

### View Mode Testing
1. Switch between all 4 view modes
2. Verify data filtering correctness
3. Check calculation accuracy in each mode
4. Confirm mode persists after page refresh

### Approval Workflow Testing
1. Submit draft project for approval
2. Approve with sufficient permissions
3. Reject and verify rollback to draft
4. Test transaction rollback on partial failure

### Permission Testing
1. Login as different roles
2. Verify UI elements show/hide correctly
3. Test API permission enforcement
4. Verify read-only mode for approved projects

### Preview & Print Testing
1. Expand preview panel and verify HTML generation
2. Collapse preview panel and verify cleanup
3. Test preview with each view mode (Total, OB, Onsite, Offshore)
4. Verify preview updates when data changes
5. Test preview with empty data (error handling)
6. Toggle preview options (logo, summary, headers)
7. Change page orientation (portrait/landscape)
8. Adjust font size and verify preview updates
9. Click Print button and verify browser print dialog opens
10. Test print preview in browser
11. Verify print CSS hides UI elements
12. Test print to PDF functionality
13. Verify page breaks for multi-page documents
14. Test preview generation performance with large datasets (100+ resources)
15. Verify logo preloading and display

### Data Integrity Testing
1. Test onsite + offshore = total validation
2. Test date range validation
3. Test concurrent edit detection
4. Test transaction atomicity

## Future Enhancements
- Real-time collaboration with WebSockets
- Advanced resource allocation algorithms
- Gantt chart visualization of resources
- Integration with time tracking systems
- Automatic cost calculation from man-days
- Resource utilization heatmaps
- Predictive analytics for resource needs
- Mobile app for on-the-go approvals
- Integration with HR systems
- Multi-currency support for offshore rates
- Resource capacity planning
- Skills matrix integration
- **Preview Enhancements**:
  - Save preview as PDF directly without browser dialog
  - Email preview PDF to stakeholders
  - Export preview to Word document
  - Custom preview templates with branding
  - Chart/graph visualization in preview
  - Multi-language preview support
  - Watermark support for draft previews
  - Preview history and versioning
  - QR code generation for preview tracking
  - Digital signature section for approvals

## Browser Compatibility
- Chrome/Edge: Full support (v90+)
- Firefox: Full support (v88+)
- Safari: Full support (v14+)
- IE11: Not supported (uses modern JavaScript features like Promise.all, async/await)

## Troubleshooting

### Issue: View mode not persisting
**Solution**: Check localStorage permissions in browser settings

### Issue: Approval transaction fails midway
**Solution**: Check network connectivity, verify all project IDs are valid, ensure user has approve permission

### Issue: Calculations incorrect in OB mode
**Solution**: Verify onsite + offshore split data is correctly saved, check filterByViewMode logic

### Issue: Tab switching causes data loss
**Solution**: Ensure data is saved before switching, implement "unsaved changes" warning

### Issue: Permission buttons still visible for wrong role
**Solution**: Clear user session cache, verify permission guards are checking current user role

### Issue: Preview panel won't expand
**Solution**: Check console for errors, verify data is loaded, ensure PreviewPanel component mounted correctly

### Issue: Preview HTML is blank or incomplete
**Solution**: Verify data filtering returns results, check htmlGenerator.js for errors, ensure view mode is valid

### Issue: Print button doesn't open browser dialog
**Solution**: Check if window.print() is supported, verify popup blockers aren't interfering, try different browser

### Issue: Company logo not showing in preview
**Solution**: Verify logo URL is accessible, check CORS settings for external images, preload logo before generating preview

### Issue: Preview doesn't update after data change
**Solution**: Check auto-refresh setting is enabled, verify event listeners for data changes, manually click refresh

### Issue: Print output looks different from preview
**Solution**: Verify @media print CSS is loaded, check browser print settings (margins, scale), test in different browser

### Issue: Page breaks in wrong places
**Solution**: Adjust ROWS_PER_PAGE setting, manually add page-break CSS classes, check table row heights

### Issue: Preview generation is slow with large data
**Solution**: Enable lazy loading, implement pagination in preview, use Web Workers for HTML generation, reduce preview complexity

## Best Practices

### Performance
- Always memoize filtered data with useMemo
- Use useCallback for event handlers passed to child components
- Implement pagination for tables with 50+ rows
- Debounce expensive calculations
- Lazy generate preview HTML only when panel expanded
- Debounce preview refresh on rapid data changes (500ms delay)
- Preload company logo image for faster preview generation
- Clear preview HTML when panel collapsed to free memory

### Security
- Never trust client-side permission checks alone
- Always validate permissions on API server
- Sanitize user inputs before saving
- Use HTTPS for approval transactions

### UX
- Provide clear feedback for all async operations
- Show loading states during API calls
- Confirm destructive actions (delete, reject)
- Auto-save drafts every 30 seconds
- Show loading spinner when generating preview
- Disable preview options while generating
- Provide visual feedback when print dialog opens
- Auto-collapse preview if data becomes empty
- Show preview generation progress for large datasets
- Persist preview options in localStorage

### Code Quality
- Use TypeScript for type safety
- Write unit tests for filtering logic
- Write integration tests for approval workflow
- Document complex business rules

## Support
For issues or questions about the Business Plan feature, contact:
- Technical Lead: [Your Name]
- Product Owner: [PO Name]
- Documentation: See BUSINESS_PLAN_INVESTIGATION.md for detailed design decisions
