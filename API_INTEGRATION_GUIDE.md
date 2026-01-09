# Timeline API Integration Guide

## Overview

Timeline system đã được rebuild hoàn toàn để tích hợp với backend API. Hệ thống support millions of records với performance optimization.

---

## API Response Structure

### Expected Format

```javascript
{
  "issueId": "258437",           // Required - Unique identifier
  "issueName": "Task name",      // Required - Display name
  "startDate": "2024-01-17",     // Optional - Start date (YYYY-MM-DD)
  "dueDate": "2024-01-30",       // Optional - Due date (YYYY-MM-DD)
  "resolvedDate": "2024-01-30",  // Optional - Completion date
  "createdDate": "2024-01-17",   // Required - Creation date
  "status": "Draft"              // Required - Task status (any string)
}
```

---

## Data Normalization

### 1. Null Date Handling

**Rule:** If both `startDate` and `dueDate` are null, but `createdDate` exists:

```javascript
startDate = createdDate - 1 day
dueDate = createdDate + 1 day
```

**Example:**
```javascript
// Input
{
  issueId: "MS-001",
  issueName: "Project Kickoff",
  startDate: null,
  dueDate: null,
  createdDate: "2024-01-10",
  status: "Milestone"
}

// Output (normalized)
{
  id: "MS-001",
  name: "Project Kickoff",
  startDate: "2024-01-09",  // createdDate - 1
  endDate: "2024-01-11",     // createdDate + 1
  status: "Milestone"
}
```

### 2. Calculated Fields

**Duration:** Days between startDate and dueDate
```javascript
duration = moment(dueDate).diff(moment(startDate), 'days')
```

**Late Time:** Days overdue from dueDate to resolvedDate
```javascript
if (resolvedDate > dueDate) {
  lateTime = moment(resolvedDate).diff(moment(dueDate), 'days')
} else {
  lateTime = 0
}
```

**Progress:** Calculated based on current date and dates
```javascript
if (resolvedDate) {
  progress = 100
} else if (now < startDate) {
  progress = 0
} else if (now > dueDate) {
  progress = 100
} else {
  progress = Math.round((now - startDate) / (dueDate - startDate) * 100)
}
```

---

## Status Color System

### 30 Predefined Colors

System support up to 30 unique statuses với 30 màu được define sẵn:

```javascript
// constants/statusColors.js
export const STATUS_COLORS = [
  '#1890ff', // Blue
  '#52c41a', // Green
  '#faad14', // Gold
  '#f5222d', // Red
  // ... 26 more colors
];
```

### Dynamic Color Assignment

**Statuses được sort A-Z và map với colors:**

1. Extract unique statuses from data
2. Sort alphabetically
3. Assign color by index (0-29)
4. If > 30 statuses → use default gray (#bfbfbf)

**Example:**
```javascript
Statuses: ['Draft', 'Completed', 'In Progress', 'Planning']
Sorted:   ['Completed', 'Draft', 'In Progress', 'Planning']

Color Map:
- Completed   → STATUS_COLORS[0] → #1890ff
- Draft       → STATUS_COLORS[1] → #52c41a
- In Progress → STATUS_COLORS[2] → #faad14
- Planning    → STATUS_COLORS[3] → #f5222d
```

---

## Performance Optimizations

### For Millions of Records

**1. Normalization:**
```javascript
// ✅ GOOD - Single loop, no methods chaining
const normalized = [];
for (let i = 0; i < apiData.length; i++) {
  const item = normalizeTimelineItem(apiData[i]);
  if (item) {
    normalized.push(item);
  }
}

// ❌ BAD - Multiple loops
apiData
  .filter(item => item)
  .map(item => normalize(item))
  .filter(item => item.isValid);
```

**2. Filtering:**
```javascript
// ✅ GOOD - Single pass filter
const filtered = [];
for (let i = 0; i < items.length; i++) {
  if (condition(items[i])) {
    filtered.push(items[i]);
  }
}

// ❌ BAD - Multiple filters
items
  .filter(filterA)
  .filter(filterB)
  .filter(filterC);
```

**3. Memoization:**
```javascript
// ✅ All expensive calculations memoized
const normalizedItems = useMemo(() => 
  normalizeTimelineData(apiData), 
  [apiData]
);

const filteredItems = useMemo(() => 
  filterItems(normalizedItems, filters), 
  [normalizedItems, filters]
);
```

**4. No Optional Chaining:**
```javascript
// ✅ GOOD - Explicit checks
if (item && item.status) {
  doSomething(item.status);
}

// ❌ BAD - Optional chaining (slower)
item?.status && doSomething(item?.status);
```

---

## Code Quality Standards

### SonarQube Compliant

1. **No Console Logs** (except errors)
2. **No Duplicate Code**
3. **Explicit Null Checks**
4. **Early Returns**
5. **Single Responsibility**

### Example: Clean Normalization

```javascript
export const normalizeTimelineItem = (item) => {
  // Early return for invalid input
  if (!item) {
    return null;
  }
  
  // Explicit destructuring
  const { 
    issueId, 
    issueName, 
    startDate, 
    dueDate, 
    resolvedDate, 
    createdDate, 
    status 
  } = item;
  
  // Validate required fields
  if (!issueId || !issueName) {
    return null;
  }
  
  // Handle date normalization
  let normalizedStartDate = startDate;
  let normalizedDueDate = dueDate;
  
  if (!startDate && !dueDate && createdDate) {
    const created = moment(createdDate);
    normalizedStartDate = created.clone().subtract(1, 'day').format('YYYY-MM-DD');
    normalizedDueDate = created.clone().add(1, 'day').format('YYYY-MM-DD');
  }
  
  // Validate dates exist
  if (!normalizedStartDate || !normalizedDueDate) {
    return null;
  }
  
  // Calculate derived fields
  const duration = calculateDuration(normalizedStartDate, normalizedDueDate);
  const lateTime = calculateLateTime(normalizedDueDate, resolvedDate);
  const progress = calculateProgress(normalizedStartDate, normalizedDueDate, resolvedDate);
  
  // Return normalized object
  return {
    id: issueId,
    name: issueName,
    startDate: normalizedStartDate,
    endDate: normalizedDueDate,
    resolvedDate: resolvedDate || null,
    createdDate: createdDate || null,
    status: status || 'Unknown',
    duration: duration,
    lateTime: lateTime,
    progress: progress
  };
};
```

---

## Integration Steps

### 1. Replace Mock API Call

**Current (Mock):**
```javascript
import { fetchTimelineData } from '../utils/mockApiData';

const data = await fetchTimelineData();
```

**Production (Real API):**
```javascript
import axios from 'axios';

const response = await axios.get('/api/timeline/items');
const data = response.data;
```

### 2. Add Error Handling

```javascript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/timeline/items');
      setApiData(response.data);
    } catch (error) {
      console.error('Failed to fetch timeline data:', error);
      // Show error notification to user
      notification.error({
        message: 'Failed to load timeline',
        description: error.message
      });
      setApiData([]);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);
```

### 3. Add Pagination (Optional)

For very large datasets:

```javascript
const [page, setPage] = useState(1);
const [pageSize] = useState(1000);

const response = await axios.get('/api/timeline/items', {
  params: { page, pageSize }
});
```

---

## Testing

### Performance Benchmarks

**Target metrics for 100,000 records:**

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Normalization | < 500ms | < 1s |
| Filtering | < 100ms | < 200ms |
| Rendering | < 1s | < 2s |

### Test Data Generator

```javascript
const generateTestData = (count) => {
  const statuses = ['Draft', 'In Progress', 'Completed', 'Testing', 'Pending'];
  const data = [];
  
  for (let i = 0; i < count; i++) {
    data.push({
      issueId: `ISSUE-${i}`,
      issueName: `Task ${i}`,
      startDate: moment().subtract(Math.random() * 365, 'days').format('YYYY-MM-DD'),
      dueDate: moment().add(Math.random() * 365, 'days').format('YYYY-MM-DD'),
      resolvedDate: Math.random() > 0.5 ? moment().format('YYYY-MM-DD') : null,
      createdDate: moment().subtract(Math.random() * 400, 'days').format('YYYY-MM-DD'),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return data;
};

// Test with 100K records
console.time('Normalize 100K');
const normalized = normalizeTimelineData(generateTestData(100000));
console.timeEnd('Normalize 100K');
```

---

## Troubleshooting

### Issue: Slow Performance

**Solution:**
1. Check if you're using `?.` optional chaining - replace with explicit checks
2. Verify memoization is working (check React DevTools)
3. Use Chrome Performance profiler
4. Consider pagination or virtualization

### Issue: Colors Not Showing

**Solution:**
1. Verify statuses are being extracted: `console.log(uniqueStatuses)`
2. Check statusColorMap: `console.log(statusColorMap)`
3. Ensure color is added to items: `console.log(itemsWithColors[0].color)`

### Issue: Milestones Not Rendering

**Solution:**
1. Check status field is "Milestone" (case-sensitive)
2. Verify dates are wrapped correctly (startDate = createdDate - 1)
3. Check getItemType() returns ITEM_TYPES.MILESTONE

---

## API Contract

### Required Backend Response

**Endpoint:** `GET /api/timeline/items`

**Response:**
```json
[
  {
    "issueId": "string (required)",
    "issueName": "string (required)",
    "startDate": "string (YYYY-MM-DD, optional)",
    "dueDate": "string (YYYY-MM-DD, optional)",
    "resolvedDate": "string (YYYY-MM-DD, optional)",
    "createdDate": "string (YYYY-MM-DD, required)",
    "status": "string (required)"
  }
]
```

**Notes:**
- `issueId` must be unique
- `status` can be any string (up to 30 unique values recommended)
- At least one of `startDate`/`dueDate` or `createdDate` must be present
- Dates in ISO format (YYYY-MM-DD)

---

## Support

For questions or issues:
- Check console for normalization warnings
- Use React DevTools to inspect memoized values
- Review [BEST_PRACTICES_TIMELINE.md](../BEST_PRACTICES_TIMELINE.md)
- Contact: CMC Development Team

---

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Status:** ✅ Production Ready
