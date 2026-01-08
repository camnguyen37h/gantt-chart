# Timeline Library - Best Practices & Code Quality Guide

## Code Quality Standards

### ✅ SonarLint Compliance

This codebase follows SonarLint best practices:

1. **No Console Logs in Production** - All debug logs removed
2. **No Duplicate Code** - Shared logic extracted to utils
3. **Proper Error Handling** - Validation at every step
4. **Type Safety** - PropTypes for all components
5. **Memory Management** - Cleanup in useEffect hooks
6. **Performance** - React.memo, useMemo, useCallback throughout

### Code Structure

```
✅ DO: Extract reusable logic to utils
✅ DO: Use TypeScript/PropTypes for type safety
✅ DO: Memoize expensive calculations
✅ DO: Keep components focused and small
✅ DO: Document complex algorithms

❌ DON'T: Put business logic in components
❌ DON'T: Use inline functions in render
❌ DON'T: Mutate props or state directly
❌ DON'T: Leave debug code in production
❌ DON'T: Create unnecessary re-renders
```

## Performance Optimization

### 1. Component Optimization

**All components use React.memo:**

```javascript
// ✅ Good
import { memo } from 'react';

const TimelineItem = memo(({ item, style }) => {
  // Component logic
});

// ❌ Bad
const TimelineItem = ({ item, style }) => {
  // Will re-render unnecessarily
};
```

### 2. Callback Optimization

**Use useCallback for event handlers:**

```javascript
// ✅ Good
const handleClick = useCallback((item) => {
  onItemClick?.(item);
}, [onItemClick]);

// ❌ Bad
const handleClick = (item) => {
  onItemClick?.(item); // New function every render
};
```

### 3. Memoization Strategy

**Memoize expensive computations:**

```javascript
// ✅ Good
const normalizedItems = useMemo(() => {
  return items.map(item => normalizeItem(item));
}, [items]);

// ❌ Bad
const normalizedItems = items.map(item => normalizeItem(item));
// Runs on every render
```

### 4. Data Flow Optimization

```
TimelineView (Parent)
  ↓ items (memoized filtered array)
Timeline (memo)
  ↓ uses useTimeline hook
  ↓ normalizedItems (memoized)
  ↓ filteredItems (memoized)
  ↓ layoutItems (memoized)
TimelineGrid (memo)
  ↓ maps layoutItems
TimelineItem (memo)
  ↓ renders based on type
```

**Key Points:**
- Each level memoizes its data
- Parent controls filtering
- Child components are pure
- No prop drilling - use context if needed

## State Management

### Filter State Pattern

```javascript
// ✅ Good - Single source of truth
const [resourceFilter, setResourceFilter] = useState('all');
const [visibleStatuses, setVisibleStatuses] = useState({});

const timelineItems = useMemo(() => {
  let filtered = allTimelineItems;
  
  if (resourceFilter !== 'all') {
    filtered = filtered.filter(item => item.status === resourceFilter);
  }
  
  const hasHiddenStatus = Object.values(visibleStatuses).some(v => v === false);
  if (hasHiddenStatus) {
    filtered = filtered.filter(item => visibleStatuses[item.status] !== false);
  }
  
  return filtered;
}, [allTimelineItems, resourceFilter, visibleStatuses]);
```

### Status Toggle Pattern

```javascript
// ✅ Good - Immutable update
const handleStatusToggle = (status) => {
  setVisibleStatuses(prev => ({
    ...prev,
    [status]: prev[status] === false ? true : false
  }));
};

// ❌ Bad - Mutates state
const handleStatusToggle = (status) => {
  visibleStatuses[status] = !visibleStatuses[status];
  setVisibleStatuses(visibleStatuses); // React won't detect change
};
```

## Item Type Detection

### Status-Based Approach (Current)

```javascript
// ✅ Good - Uses status field consistently
export const getItemType = (item) => {
  if (item.status === 'No Plan') {
    return ITEM_TYPES.MILESTONE;
  }
  if (item.startDate && item.endDate) {
    return ITEM_TYPES.RANGE;
  }
  return null;
};

// ❌ Bad - Scattered flags
if (item.isMilestone || item.type === 'milestone' || !item.endDate) {
  // Inconsistent, hard to maintain
}
```

**Benefits:**
- Single source of truth (status field)
- Easy to validate
- No redundant flags
- Clear separation of concerns

## Data Structure Standards

### Unified Item Structure

```javascript
// ✅ Good - Consistent structure
{
  id: string | number,    // Required
  name: string,           // Required
  startDate: string,      // Required (ISO format)
  endDate: string,        // Required (ISO format)
  status: string,         // Required (determines type & color)
  progress: number        // Optional (0-100)
}

// ❌ Bad - Inconsistent fields
{
  id: 1,
  name: 'Task',
  start: '2024-01-01',    // Inconsistent naming
  end: '2024-02-01',
  isMilestone: false,     // Redundant flag
  color: '#ff0000',       // Should derive from status
  resource: 'Team A',     // Not used
  createdDate: '...'      // Redundant for non-milestones
}
```

### Milestone Date Wrapping

```javascript
// ✅ Good - Helper function
const createMilestone = (name, actualDate) => {
  const actual = moment(actualDate);
  return {
    id: `ms-${Date.now()}`,
    name,
    startDate: actual.clone().subtract(1, 'day').format('YYYY-MM-DD'),
    endDate: actual.clone().add(1, 'day').format('YYYY-MM-DD'),
    status: 'No Plan',
    progress: 0
  };
};

// ❌ Bad - Manual wrapping (error-prone)
{
  id: 'ms-1',
  name: 'Milestone',
  startDate: '2024-01-09',  // Easy to get wrong
  endDate: '2024-01-11',
  status: 'No Plan'
}
```

## CSS Best Practices

### BEM Naming Convention

```css
/* ✅ Good - BEM methodology */
.timeline {}
.timeline-scroll-container {}
.timeline-item {}
.timeline-item--milestone {}
.timeline-item__content {}
.timeline-item__progress-bar {}

/* ❌ Bad - Unclear hierarchy */
.item {}
.milestone {}
.content {}
```

### CSS Variables for Theming

```css
/* ✅ Good - Customizable */
:root {
  --timeline-row-height: 50px;
  --timeline-item-height: 32px;
  --timeline-bg-color: #ffffff;
  --timeline-grid-color: #e8e8e8;
}

.timeline-item {
  height: var(--timeline-item-height);
}

/* ❌ Bad - Hard-coded values */
.timeline-item {
  height: 32px; /* Can't customize
}
```

## Testing Guidelines

### Unit Testing

```javascript
// Test item type detection
describe('getItemType', () => {
  it('should return MILESTONE for status "No Plan"', () => {
    const item = { status: 'No Plan', startDate: '2024-01-01', endDate: '2024-01-02' };
    expect(getItemType(item)).toBe(ITEM_TYPES.MILESTONE);
  });
  
  it('should return RANGE for items with start and end dates', () => {
    const item = { status: 'Implementing', startDate: '2024-01-01', endDate: '2024-02-01' };
    expect(getItemType(item)).toBe(ITEM_TYPES.RANGE);
  });
  
  it('should return null for invalid items', () => {
    const item = { name: 'Invalid' };
    expect(getItemType(item)).toBe(null);
  });
});
```

### Integration Testing

```javascript
// Test filter chain
describe('Timeline filtering', () => {
  it('should filter by status', () => {
    const items = [
      { id: 1, status: 'Planning', ... },
      { id: 2, status: 'Implementing', ... }
    ];
    const filtered = filterByStatus(items, 'Planning');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
  });
});
```

## Error Handling

### Input Validation

```javascript
// ✅ Good - Validate early
export const normalizeItem = (item) => {
  if (!item) {
    console.warn('normalizeItem: item is null or undefined');
    return null;
  }
  
  if (!item.id) {
    console.warn('normalizeItem: item missing required id', item);
    return null;
  }
  
  const type = getItemType(item);
  if (!type) {
    console.warn('normalizeItem: unable to determine item type', item);
    return null;
  }
  
  // Proceed with normalization
};
```

### Safe Property Access

```javascript
// ✅ Good - Optional chaining
const handleClick = (item) => {
  onItemClick?.(item);
};

const color = item?.color ?? getDefaultItemColor(item);

// ❌ Bad - Potential errors
const handleClick = (item) => {
  onItemClick(item); // Error if undefined
};
```

## Accessibility

### ARIA Labels

```jsx
// ✅ Good - Accessible
<div
  className="timeline-item"
  role="button"
  aria-label={`${item.name} from ${startDate} to ${endDate}`}
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={handleKeyPress}
>
```

### Keyboard Navigation

```javascript
// ✅ Good - Keyboard support
const handleKeyPress = (e, item) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick(item);
  }
};
```

## Documentation

### Code Comments

```javascript
// ✅ Good - Explains WHY
// Milestones use wrapped dates to create a 2-day range for positioning
// This ensures they appear at the correct date while maintaining consistent layout
const milestoneDate = moment(item.startDate).add(1, 'day');

// ❌ Bad - Explains WHAT (obvious from code)
// Add 1 day to start date
const milestoneDate = moment(item.startDate).add(1, 'day);
```

### JSDoc for Public APIs

```javascript
/**
 * Calculate item positions and dimensions
 * @param {Object} item - Timeline item
 * @param {Object} timelineData - Timeline date range and configuration
 * @param {number} zoomLevel - Current zoom level (1 = 100%)
 * @returns {Object} CSS style object with positioning
 */
export const getItemStyle = (item, timelineData, zoomLevel) => {
  // Implementation
};
```

## Migration Guide

### From v1 (Google Charts) to v2 (Custom)

**Before:**
```javascript
<GanttChartGoogle items={items} />
```

**After:**
```javascript
<Timeline 
  items={items}
  config={{ viewMode: 'months', pixelsPerDay: 8 }}
  showLegend={true}
/>
```

**Data Structure Changes:**
- `isMilestone` flag → `status: 'No Plan'`
- `createdDate` → wrapped in `startDate`/`endDate`
- `color` property → derived from `status`
- `resource` property → removed (use `status` for grouping)

## Common Pitfalls

### 1. Forgetting to Memoize

```javascript
// ❌ Bad - Creates new object every render
<Timeline 
  config={{ viewMode: 'months' }}  // New object!
/>

// ✅ Good - Memoize config
const config = useMemo(() => ({ viewMode: 'months' }), []);
<Timeline config={config} />
```

### 2. Incorrect Milestone Dates

```javascript
// ❌ Bad - startDate = endDate (no range)
{
  startDate: '2024-01-10',
  endDate: '2024-01-10',
  status: 'No Plan'
}

// ✅ Good - Wrapped date
{
  startDate: '2024-01-09',  // actual - 1
  endDate: '2024-01-11',    // actual + 1
  status: 'No Plan'
}
```

### 3. Mutating Props

```javascript
// ❌ Bad - Mutates item
const handleClick = (item) => {
  item.selected = true;  // Mutates prop!
  setSelected(item);
};

// ✅ Good - Create new object
const handleClick = (item) => {
  setSelected({ ...item, selected: true });
};
```

## Maintenance Checklist

Before committing changes:

- [ ] No console.log in production code
- [ ] All components wrapped in React.memo where appropriate
- [ ] Expensive calculations memoized with useMemo
- [ ] Event handlers wrapped in useCallback
- [ ] PropTypes defined for all components
- [ ] No duplicate code (DRY principle)
- [ ] Accessibility attributes added
- [ ] Error handling in place
- [ ] Code documented with comments
- [ ] Tests updated/added
- [ ] Performance profiled (React DevTools)
- [ ] No SonarLint warnings

## Performance Metrics

Target performance for 100 items:
- Initial render: < 200ms
- Filter change: < 50ms
- Scroll: 60 FPS
- Search: < 100ms

Monitor with React DevTools Profiler.

## Support

For questions or issues:
1. Check documentation first
2. Review examples in TimelineView.jsx
3. Check debug logs (development mode only)
4. Contact: CMC Development Team
