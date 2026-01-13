# Row Assignment Algorithm Documentation

## Tổng Quan

Timeline sử dụng **Greedy First-Fit Algorithm** để tự động phân bổ rows cho các tasks, đảm bảo không có items nào overlap (chồng chéo) lên nhau.

## 📍 Nơi Xử Lý Row Assignment

### 1. Layout Calculation: `layoutUtils.js`

File: `src/lib/Timeline/utils/layoutUtils.js`

#### Function: `calculateAdvancedLayout(items)`

```javascript
/**
 * Advanced layout with conflict resolution
 * Uses greedy first-fit algorithm for optimal performance
 * @param {Array} items - Timeline items
 * @returns {Array} Items with row assignments
 * 
 * Complexity: O(n × m) where n = items, m = rows (typically m << n)
 */
export const calculateAdvancedLayout = (items) => {
  if (!items || items.length === 0) return [];

  // Bước 1: Sắp xếp items theo startDate
  const sortedItems = sortItemsByDate(items);
  
  // Bước 2: Khởi tạo array tracking rows
  const rows = []; // Mỗi row lưu {endTime} của item cuối cùng
  const result = [];

  // Bước 3: Duyệt qua từng item đã sắp xếp
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const startDate = getItemDate(item);
    
    if (!startDate) continue; // Bỏ qua items không hợp lệ

    const endDate = getItemEndDate(item);
    const itemEnd = endDate || startDate.clone().add(1, 'day');
    
    // Cache timestamps để so sánh nhanh
    const itemStartTime = startDate.valueOf();
    const itemEndTime = itemEnd.valueOf();

    // Bước 4: Tìm row đầu tiên có thể fit item này
    let targetRow = -1;
    
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowEndTime = rows[rowIdx].endTime;
      
      // Kiểm tra overlap:
      // - Overlap nếu: rowEndTime >= itemStartTime
      // - Không overlap nếu: rowEndTime < itemStartTime
      if (rowEndTime < itemStartTime) {
        targetRow = rowIdx;
        break; // Early exit - đã tìm được row phù hợp
      }
    }

    // Bước 5: Tạo row mới nếu không tìm được row phù hợp
    if (targetRow === -1) {
      targetRow = rows.length;
      rows.push({ endTime: itemEndTime });
    } else {
      // Update endTime của row đã chọn
      rows[targetRow].endTime = itemEndTime;
    }

    // Bước 6: Gán row cho item
    result.push({ ...item, row: targetRow });
  }

  return result;
};
```

## 🔄 Algorithm Flow

### Ví dụ với 3 Tasks

**Input:**
```javascript
const tasks = [
  { id: 1, name: 'Task A', startDate: '2026-01-10', endDate: '2026-01-20' },
  { id: 2, name: 'Task B', startDate: '2026-01-15', endDate: '2026-01-25' },
  { id: 3, name: 'Task C', startDate: '2026-01-21', endDate: '2026-01-30' }
];
```

**Processing:**

**Iteration 1: Task A**
- `itemStartTime`: Jan 10
- `itemEndTime`: Jan 20
- `rows = []` (empty)
- `targetRow = -1` (không tìm được row)
- Tạo row mới: `rows = [{ endTime: Jan 20 }]`
- Result: `{ ...Task A, row: 0 }`

**Iteration 2: Task B**
- `itemStartTime`: Jan 15
- `itemEndTime`: Jan 25
- `rows = [{ endTime: Jan 20 }]`
- Check row 0: `Jan 20 < Jan 15?` → **FALSE** (overlap!)
- `targetRow = -1` (không tìm được row)
- Tạo row mới: `rows = [{ endTime: Jan 20 }, { endTime: Jan 25 }]`
- Result: `{ ...Task B, row: 1 }`

**Iteration 3: Task C**
- `itemStartTime`: Jan 21
- `itemEndTime`: Jan 30
- `rows = [{ endTime: Jan 20 }, { endTime: Jan 25 }]`
- Check row 0: `Jan 20 < Jan 21?` → **TRUE** (fit!)
- `targetRow = 0`
- Update row 0: `rows = [{ endTime: Jan 30 }, { endTime: Jan 25 }]`
- Result: `{ ...Task C, row: 0 }`

**Output:**
```javascript
[
  { id: 1, name: 'Task A', startDate: '...', endDate: '...', row: 0 },
  { id: 2, name: 'Task B', startDate: '...', endDate: '...', row: 1 },
  { id: 3, name: 'Task C', startDate: '...', endDate: '...', row: 0 }
]
```

**Visual:**
```
Row 0: [====Task A====]        [====Task C====]
Row 1:           [====Task B====]
       Jan 10    Jan 15  Jan 20  Jan 25  Jan 30
```

## 📊 Rendering Pipeline

### 2. Hook Integration: `useTimeline.js`

File: `src/lib/Timeline/hooks/useTimeline.js`

#### Gọi Layout Calculation

```javascript
// Line 96-99
const layoutItems = useMemo(() => {
  if (!filteredItems || !timelineData) return [];
  return calculateAdvancedLayout(filteredItems); // Gọi algorithm
}, [filteredItems, timelineData]);
```

#### Convert Row → CSS Position

```javascript
// Line 108-146
const getItemStyle = useCallback((item) => {
  if (!timelineData) return {};

  const moment = require('moment');
  const pixelsPerDay = finalConfig.pixelsPerDay * zoomLevel;

  // Milestone items
  if (isMilestone(item)) {
    const milestoneDate = item.createdDate ? 
      moment(item.createdDate) : moment(item.startDate);
    const daysFromStart = milestoneDate.diff(timelineData.start, 'days', true);
    const left = daysFromStart * pixelsPerDay;
    const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

    return {
      left: `${left}px`,
      top: `${top}px`
    };
  }

  // Range items
  const startDate = getItemDate(item);
  if (!startDate) return {};
  
  const endDate = getItemEndDate(item);
  const daysFromStart = startDate.diff(timelineData.start, 'days', true);
  const duration = endDate.diff(startDate, 'days', true);
  
  const left = daysFromStart * pixelsPerDay;
  const width = duration * pixelsPerDay;
  
  // ⭐ Công thức tính top position dựa trên row
  const top = item.row * finalConfig.rowHeight + finalConfig.itemPadding;

  return {
    left: `${left}px`,      // Horizontal: theo ngày
    width: `${width}px`,    // Width: theo duration
    top: `${top}px`,        // Vertical: theo row ⭐
    height: `${finalConfig.itemHeight}px`,
    backgroundColor: item.color
  };
}, [timelineData, finalConfig, zoomLevel]);
```

### 3. Component Rendering: `TimelineGrid.jsx`

File: `src/lib/Timeline/components/TimelineGrid.jsx`

```javascript
{/* Timeline Items */}
{layoutItems.map((item, index) => {
  const style = getItemStyle(item); // Get position từ row
  const animationDelay = Math.min(index * 0.02, 1);
  const enhancedStyle = {
    ...style,
    animationDelay: `${animationDelay}s`
  };
  return renderTimelineItem(item, enhancedStyle, index);
})}
```

### 4. Item Component: `TimelineItem.jsx`

```javascript
<div 
  className="timeline-item" 
  style={{
    position: 'absolute',
    left: style.left,    // From getItemStyle
    top: style.top,      // From row calculation ⭐
    width: style.width,
    height: style.height,
    backgroundColor: style.backgroundColor
  }}
>
  {/* Item content */}
</div>
```

## ⚙️ Configuration

### Default Config

```javascript
// src/lib/Timeline/constants.js
export const DEFAULT_CONFIG = {
  rowHeight: 60,      // Khoảng cách giữa các rows (px)
  itemHeight: 30,     // Chiều cao của mỗi item (px)
  itemPadding: 15,    // Padding từ đầu row (px)
  pixelsPerDay: 40    // Pixels per day for horizontal scaling
};
```

### Công Thức Tính Position

```javascript
// Vertical Position (theo row)
top = item.row × rowHeight + itemPadding

// Examples với rowHeight=60, itemPadding=15:
// Row 0: top = 0 × 60 + 15 = 15px
// Row 1: top = 1 × 60 + 15 = 75px
// Row 2: top = 2 × 60 + 15 = 135px
// Row 3: top = 3 × 60 + 15 = 195px

// Horizontal Position (theo ngày)
left = daysFromStart × pixelsPerDay

// Examples với pixelsPerDay=40:
// 0 days: left = 0 × 40 = 0px
// 5 days: left = 5 × 40 = 200px
// 10 days: left = 10 × 40 = 400px

// Width (theo duration)
width = duration × pixelsPerDay

// Examples:
// 1 day: width = 1 × 40 = 40px
// 7 days: width = 7 × 40 = 280px
// 30 days: width = 30 × 40 = 1200px
```

### Grid Height Calculation

```javascript
// src/lib/Timeline/utils/layoutUtils.js
export const calculateGridHeight = (layoutItems, rowHeight) => {
  if (!layoutItems || layoutItems.length === 0) return rowHeight;
  
  const maxRow = Math.max(...layoutItems.map(item => item.row || 0));
  return (maxRow + 1) * rowHeight + 40; // +40 for padding
};

// Examples:
// maxRow = 2 → height = (2+1) × 60 + 40 = 220px
// maxRow = 5 → height = (5+1) × 60 + 40 = 400px
// maxRow = 10 → height = (10+1) × 60 + 40 = 700px
```

## 🔍 Complete Data Flow

```
1. User Input
   └─> Raw items: [{ id, name, startDate, endDate, status, ... }]

2. useTimeline Hook
   └─> Normalize items
       └─> Filter & Search
           └─> filteredItems

3. calculateAdvancedLayout(filteredItems)
   └─> Sort by date
       └─> Greedy First-Fit Algorithm
           └─> Assign rows: [{ ...item, row: 0 }, { ...item, row: 1 }]
               └─> layoutItems

4. getItemStyle(item)
   └─> Calculate CSS position:
       - left = daysFromStart × pixelsPerDay
       - width = duration × pixelsPerDay
       - top = item.row × rowHeight + itemPadding ⭐
       - height = itemHeight
       └─> style object

5. TimelineGrid Component
   └─> Map over layoutItems
       └─> Render TimelineItem with position: absolute
           └─> Visual timeline with no overlaps ✨
```

## 🎯 Key Features

### 1. No Overlapping
- Algorithm đảm bảo không có 2 items nào chồng lên nhau
- Mỗi row track endTime của item cuối cùng
- Chỉ add item mới vào row nếu `rowEndTime < itemStartTime`

### 2. Optimal Space Usage
- Greedy first-fit tìm row available đầu tiên
- Minimize số lượng rows cần thiết
- Reuse rows khi có thể

### 3. Performance
- **Time Complexity:** O(n × m)
  - n = số lượng items
  - m = số lượng rows (thường m << n)
- **Space Complexity:** O(n)
  - Store result array và rows array
- **Optimizations:**
  - Early exit khi tìm được row
  - Timestamp caching với `.valueOf()`
  - Single pass qua sorted items

### 4. Visual Consistency
- Items được render theo position: absolute
- Top position dựa trên row number
- Left/width dựa trên dates
- Tất cả items trong cùng row có cùng Y position

## 📝 Example Use Case

```javascript
// Input: 5 concurrent tasks
const tasks = [
  { id: 1, startDate: '2026-01-01', endDate: '2026-01-15' },
  { id: 2, startDate: '2026-01-10', endDate: '2026-01-20' },
  { id: 3, startDate: '2026-01-16', endDate: '2026-01-25' },
  { id: 4, startDate: '2026-01-12', endDate: '2026-01-22' },
  { id: 5, startDate: '2026-01-26', endDate: '2026-02-05' }
];

// After calculateAdvancedLayout:
const layoutItems = [
  { id: 1, ..., row: 0 },  // Jan 1-15
  { id: 2, ..., row: 1 },  // Jan 10-20 (overlaps with 1)
  { id: 3, ..., row: 0 },  // Jan 16-25 (fits in row 0 after task 1)
  { id: 4, ..., row: 2 },  // Jan 12-22 (overlaps with 1 & 2)
  { id: 5, ..., row: 0 }   // Jan 26-Feb 5 (fits in row 0 after task 3)
];

// Visual Result:
// Row 0: [==Task 1==]  [==Task 3==]  [==Task 5==]
// Row 1:      [==Task 2==]
// Row 2:         [==Task 4==]
//        Jan1   Jan10  Jan16 Jan22 Jan26  Feb5
```

## 🛠️ Customization

### Adjust Row Height
```javascript
// src/lib/Timeline/constants.js
export const DEFAULT_CONFIG = {
  rowHeight: 80,  // Tăng spacing giữa rows
  itemHeight: 40,
  itemPadding: 20
};
```

### Custom Layout Algorithm
Có thể thay thế `calculateAdvancedLayout` bằng algorithm khác:

```javascript
// Option 1: Simple stacking (no optimization)
export const calculateSimpleLayout = (items) => {
  return items.map((item, index) => ({
    ...item,
    row: index  // Mỗi item 1 row riêng
  }));
};

// Option 2: Group by property
export const calculateGroupedLayout = (items, groupBy) => {
  const groups = {};
  items.forEach(item => {
    const key = item[groupBy] || 'default';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  
  let currentRow = 0;
  const result = [];
  
  Object.values(groups).forEach(group => {
    group.forEach(item => {
      result.push({ ...item, row: currentRow });
      currentRow++;
    });
  });
  
  return result;
};
```

## 🐛 Troubleshooting

### Items Overlapping
**Nguyên nhân:** Algorithm không được gọi hoặc row assignment bị override
**Giải pháp:** Kiểm tra `layoutItems` có property `row` không

```javascript
console.log(layoutItems[0]); // Phải có { ...item, row: 0 }
```

### Items Not Visible
**Nguyên nhân:** Top position tính sai hoặc grid height không đủ
**Giải pháp:** Check `calculateGridHeight` và `getItemStyle`

```javascript
console.log(gridHeight); // Phải >= (maxRow + 1) × rowHeight
console.log(getItemStyle(item).top); // Phải valid số
```

### Performance Issues
**Nguyên nhân:** Quá nhiều rows hoặc items
**Giải pháp:** 
- Sử dụng virtual scrolling cho > 10K items
- Optimize rowHeight để giảm số rows
- Filter items trước khi render

## 📚 Related Files

- **Algorithm:** `src/lib/Timeline/utils/layoutUtils.js`
- **Hook:** `src/lib/Timeline/hooks/useTimeline.js`
- **Components:** 
  - `src/lib/Timeline/components/TimelineGrid.jsx`
  - `src/lib/Timeline/components/TimelineItem.jsx`
- **Config:** `src/lib/Timeline/constants.js`
- **Utils:** 
  - `src/lib/Timeline/utils/itemUtils.js`
  - `src/lib/Timeline/utils/dateUtils.js`

---

**Last Updated:** January 14, 2026  
**Version:** 1.0.0
