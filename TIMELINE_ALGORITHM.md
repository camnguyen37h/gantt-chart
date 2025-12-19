# Thuật Toán Vẽ Biểu Đồ Timeline/Gantt Chart

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Bài Toán](#bài-toán)
3. [Thuật Toán Greedy](#thuật-toán-greedy)
4. [Phân Tích Chi Tiết](#phân-tích-chi-tiết)
5. [Implementation](#implementation)
6. [Ví Dụ Minh Họa](#ví-dụ-minh-họa)
7. [Độ Phức Tạp](#độ-phức-tạp)
8. [So Sánh Các Phương Pháp](#so-sánh-các-phương-pháp)

---

## Tổng Quan

Timeline/Gantt Chart là công cụ trực quan hóa quan trọng trong quản lý dự án, cho phép hiển thị:
- **Thời gian bắt đầu và kết thúc** của các tasks
- **Quan hệ thời gian** giữa các tasks
- **Tiến độ thực hiện** của dự án

### Vấn Đề Cốt Lõi
Làm thế nào để **sắp xếp các task bars** trên timeline sao cho:
1. ✅ Không có sự chồng lấn (overlap) về mặt thời gian trên cùng một row
2. ✅ Tối ưu không gian (compact layout)
3. ✅ Dễ đọc và theo dõi

---

## Bài Toán

### Input
Danh sách các tasks với thông tin:
```javascript
[
  { id, name, startDate, endDate, color },
  { id, name, startDate, endDate, color },
  ...
]
```

### Output
Danh sách tasks với **row assignment** (chỉ số dòng):
```javascript
[
  { id, name, startDate, endDate, color, row: 0 },
  { id, name, startDate, endDate, color, row: 1 },
  { id, name, startDate, endDate, color, row: 0 },
  ...
]
```

### Constraints (Ràng Buộc)
1. **Non-overlapping**: Hai tasks trên cùng một row không được chồng lấn về thời gian
2. **Compact**: Số lượng rows phải được tối thiểu hóa
3. **Ordered**: Tasks được xử lý theo thứ tự thời gian

---

## Thuật Toán Greedy

### Tên Gọi
**Greedy Row Assignment Algorithm** hoặc **First-Fit Decreasing Algorithm**

### Ý Tưởng Chính
> "Đặt mỗi task vào **row đầu tiên có thể** mà không gây chồng lấn. Nếu không có row nào phù hợp, tạo row mới."

### Pseudocode

```
FUNCTION layoutTasks(tasks):
    // Bước 1: Sắp xếp theo startDate
    sortedTasks = SORT(tasks BY startDate ASC)
    
    // Bước 2: Khởi tạo
    rows = []  // Mảng 2 chiều chứa các rows
    
    // Bước 3: Xử lý từng task
    FOR EACH task IN sortedTasks:
        // Tìm row phù hợp
        foundRow = FALSE
        
        FOR rowIndex FROM 0 TO rows.length - 1:
            lastTaskInRow = rows[rowIndex][rows[rowIndex].length - 1]
            
            IF lastTaskInRow.endDate < task.startDate:
                // Có thể đặt vào row này
                rows[rowIndex].PUSH(task WITH row: rowIndex)
                foundRow = TRUE
                BREAK
        
        // Nếu không tìm thấy row phù hợp, tạo row mới
        IF NOT foundRow:
            newRowIndex = rows.length
            rows.PUSH([task WITH row: newRowIndex])
    
    // Bước 4: Flatten array
    RETURN FLATTEN(rows)
```

---

## Phân Tích Chi Tiết

### Bước 1: Sắp Xếp (Sorting)

**Tại sao phải sort theo startDate?**
- Đảm bảo xử lý tasks theo thứ tự thời gian
- Thuật toán greedy chỉ hoạt động tối ưu khi input đã được sắp xếp
- Giúp dễ dàng kiểm tra overlap

```javascript
const sortedItems = [...items].sort((a, b) =>
  moment(a.startDate).valueOf() - moment(b.startDate).valueOf()
);
```

**Complexity**: O(n log n) với n là số lượng tasks

### Bước 2: Tìm Row Phù Hợp

**Logic kiểm tra overlap:**

```
Task A:     [========]
Task B:                  [========]
            ^          ^
         endA       startB

ĐK: endA < startB → Không overlap → Cùng row OK ✅
```

```
Task A:     [==============]
Task B:            [========]
            ^     ^
         endA  startB

ĐK: endA >= startB → Có overlap → Phải khác row ❌
```

**Code Implementation:**
```javascript
let rowIndex = rows.findIndex(row => {
  const lastItem = row[row.length - 1];
  return moment(lastItem.endDate).isBefore(itemStart);
});
```

### Bước 3: Row Assignment

**Case 1: Tìm thấy row phù hợp**
```javascript
if (rowIndex !== -1) {
  rows[rowIndex].push({ ...task, row: rowIndex });
}
```

**Case 2: Không tìm thấy row phù hợp → Tạo row mới**
```javascript
if (rowIndex === -1) {
  rowIndex = rows.length;
  rows.push([]);
  rows[rowIndex].push({ ...task, row: rowIndex });
}
```

---

## Implementation

### Full JavaScript Implementation

```javascript
import moment from 'moment';

/**
 * Auto-layout algorithm for timeline chart
 * Assigns each item to a row to prevent overlapping
 */
const layoutItems = useMemo(() => {
  if (!items || !timelineData) return [];

  // Step 1: Sort by start date
  const sortedItems = [...items].sort((a, b) =>
    moment(a.startDate).valueOf() - moment(b.startDate).valueOf()
  );

  // Step 2: Initialize rows array
  const rows = [];
  
  // Step 3: Process each item
  sortedItems.forEach(item => {
    if (!item.startDate || !item.endDate) return;

    const itemStart = moment(item.startDate);
    const itemEnd = moment(item.endDate);

    // Find first available row
    let rowIndex = rows.findIndex(row => {
      const lastItem = row[row.length - 1];
      return moment(lastItem.endDate).isBefore(itemStart);
    });

    // If no available row found, create new row
    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push([]);
    }

    // Assign item to row
    rows[rowIndex].push({ ...item, row: rowIndex });
  });

  // Step 4: Flatten array
  return rows.flat();
}, [items, timelineData]);
```

### TypeScript Implementation (với types)

```typescript
interface Task {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  row?: number;
}

function layoutTasks(tasks: Task[]): Task[] {
  // Sort by start date
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const rows: Task[][] = [];

  sortedTasks.forEach(task => {
    const taskStart = new Date(task.startDate);
    
    // Find first available row
    const rowIndex = rows.findIndex(row => {
      const lastTask = row[row.length - 1];
      return new Date(lastTask.endDate) < taskStart;
    });

    if (rowIndex === -1) {
      // Create new row
      rows.push([{ ...task, row: rows.length }]);
    } else {
      // Add to existing row
      rows[rowIndex].push({ ...task, row: rowIndex });
    }
  });

  return rows.flat();
}
```

---

## Ví Dụ Minh Họa

### Example 1: Basic Case

**Input:**
```javascript
const tasks = [
  { id: 1, name: 'Task A', startDate: '2025-01-01', endDate: '2025-01-15' },
  { id: 2, name: 'Task B', startDate: '2025-01-10', endDate: '2025-01-25' },
  { id: 3, name: 'Task C', startDate: '2025-01-20', endDate: '2025-02-05' },
];
```

**Quá trình xử lý:**

```
Step 1: Sort (đã sorted)
Tasks: [Task A, Task B, Task C]

Step 2: Initialize
rows = []

Step 3: Process Task A (Jan 1 - Jan 15)
  - rows rỗng → Tạo row 0
  - rows = [[Task A (row:0)]]

Step 4: Process Task B (Jan 10 - Jan 25)
  - Check row 0: Task A end (Jan 15) < Task B start (Jan 10)? NO
  - Không có row phù hợp → Tạo row 1
  - rows = [[Task A (row:0)], [Task B (row:1)]]

Step 5: Process Task C (Jan 20 - Feb 5)
  - Check row 0: Task A end (Jan 15) < Task C start (Jan 20)? YES ✅
  - Đặt vào row 0
  - rows = [[Task A (row:0), Task C (row:0)], [Task B (row:1)]]
```

**Output:**
```javascript
[
  { id: 1, name: 'Task A', startDate: '2025-01-01', endDate: '2025-01-15', row: 0 },
  { id: 2, name: 'Task B', startDate: '2025-01-10', endDate: '2025-01-25', row: 1 },
  { id: 3, name: 'Task C', startDate: '2025-01-20', endDate: '2025-02-05', row: 0 },
]
```

**Visual Representation:**
```
Timeline:
Jan 1         Jan 10        Jan 20        Jan 25        Feb 5
|-------------|-------------|-------------|-------------|

Row 0:  [===Task A===]           [======Task C=======]
Row 1:              [====Task B=====]
```

### Example 2: Complex Case

**Input:**
```javascript
const tasks = [
  { id: 1, startDate: '2025-02-01', endDate: '2025-03-15' }, // Task B
  { id: 2, startDate: '2025-02-15', endDate: '2025-03-20' }, // Task A
  { id: 3, startDate: '2025-03-01', endDate: '2025-03-20' }, // Task C
  { id: 4, startDate: '2025-03-10', endDate: '2025-05-15' }, // Task D
  { id: 5, startDate: '2025-05-01', endDate: '2025-06-30' }, // Task E
];
```

**Processing Steps:**

```
After Sort: B, A, C, D, E

1. Task B (Feb 1 - Mar 15)
   → Row 0: [B]

2. Task A (Feb 15 - Mar 20)
   → Row 0: B ends Mar 15 < Feb 15? NO
   → Row 1: [A]

3. Task C (Mar 1 - Mar 20)
   → Row 0: B ends Mar 15 < Mar 1? NO
   → Row 1: A ends Mar 20 < Mar 1? NO
   → Row 2: [C]

4. Task D (Mar 10 - May 15)
   → Row 0: B ends Mar 15 < Mar 10? NO (Mar 15 = Mar 15, not strictly less)
   → Actually: Mar 15 < Mar 10? NO
   → Wait, let me recalculate...
   → B ends on Mar 15, D starts Mar 10
   → Mar 15 < Mar 10? NO (FALSE)
   → Row 1: A ends Mar 20 < Mar 10? NO
   → Row 2: C ends Mar 20 < Mar 10? NO
   → Row 3: [D]

Actually, let me use .isBefore() logic correctly:
moment('2025-03-15').isBefore(moment('2025-03-10')) = false
So task D cannot go into Row 0.

5. Task E (May 1 - Jun 30)
   → Row 0: B ends Mar 15 < May 1? YES ✅
   → Row 0: [B, E]
```

**Final Layout:**
```
Row 0: [B (Feb1-Mar15)]          [E (May1-Jun30)]
Row 1:         [A (Feb15-Mar20)]
Row 2:                 [C (Mar1-Mar20)]
Row 3:                      [D (Mar10-May15)]
```

---

## Độ Phức Tạp

### Time Complexity

1. **Sorting**: O(n log n)
2. **Row Assignment**: O(n × m)
   - n = số lượng tasks
   - m = số lượng rows (worst case: m = n)
3. **Total**: O(n log n + n × m) = **O(n²)** worst case

### Space Complexity

- **Rows array**: O(n) trong worst case (mỗi task một row)
- **Output array**: O(n)
- **Total**: **O(n)**

### Best vs Worst Case

**Best Case**: O(n log n)
- Tất cả tasks không overlap
- Chỉ cần 1 row
```
[====][====][====][====]
```

**Worst Case**: O(n²)
- Tất cả tasks overlap hoàn toàn
- Cần n rows
```
Row 0: [================]
Row 1: [================]
Row 2: [================]
Row 3: [================]
```

**Average Case**: O(n log n + n × √n) ≈ **O(n log n)**
- Thực tế, số rows thường << n
- Thuật toán rất hiệu quả cho hầu hết use cases

---

## So Sánh Các Phương Pháp

### 1. Greedy First-Fit (Current Implementation)

**Đặc điểm:**
- ✅ Simple, easy to implement
- ✅ Fast: O(n log n) average case
- ✅ Compact layout
- ✅ Predictable results
- ⚠️ Not optimal in all cases
- ⚠️ No grouping by relationships

**Use cases:**
- Timeline views (Monday.com, Asana)
- Gantt charts without dependencies
- Quick visualization needs

### 2. Resource-Based Swimlanes

**Đặc điểm:**
```
Team A:  [====][====]     [====]
Team B:     [====]  [====]
Team C:  [====]        [========]
```

- ✅ Clear resource allocation
- ✅ Easy to track who does what
- ❌ Wasted space
- ❌ More rows needed

**Use cases:**
- Microsoft Project
- Resource planning
- Team capacity view

### 3. Dependency-Aware Layout

**Đặc điểm:**
```
Task A: [====]
         └─→ Task B: [====]
              └─→ Task C: [====]
```

- ✅ Shows relationships
- ✅ Critical path visible
- ❌ More complex algorithm
- ❌ May need more rows

**Use cases:**
- Jira Timeline
- Project planning with dependencies
- Critical path analysis

### 4. Manual Positioning

**Đặc điểm:**
- ✅ Full control
- ✅ Can group logically
- ❌ Time-consuming
- ❌ Error-prone

**Use cases:**
- Presentation mode
- Custom layouts
- Final adjustments

### Comparison Table

| Phương Pháp | Complexity | Space Efficiency | Visual Clarity | Flexibility |
|-------------|------------|------------------|----------------|-------------|
| **Greedy First-Fit** | O(n log n) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Resource Swimlanes** | O(n) | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Dependency-Aware** | O(n²) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Manual** | - | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Tối Ưu Hóa & Cải Tiến

### 1. Early Termination

```javascript
// Thay vì duyệt hết tất cả rows
let rowIndex = rows.findIndex(row => {
  const lastItem = row[row.length - 1];
  return moment(lastItem.endDate).isBefore(itemStart);
});

// → findIndex đã có early termination built-in ✅
```

### 2. Binary Search cho Row Selection

Nếu rows được sort theo endDate của last item:

```javascript
function findRowBinarySearch(rows, itemStart) {
  let left = 0, right = rows.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const lastItem = rows[mid][rows[mid].length - 1];
    
    if (moment(lastItem.endDate).isBefore(itemStart)) {
      result = mid;
      right = mid - 1; // Tìm row nhỏ hơn (ưu tiên compact)
    } else {
      left = mid + 1;
    }
  }
  
  return result;
}
```

**Improvement**: O(n log m) thay vì O(n × m)

### 3. Caching & Memoization

```javascript
const layoutItems = useMemo(() => {
  // Chỉ recalculate khi items hoặc timelineData thay đổi
  // ...
}, [items, timelineData]);
```

### 4. Hybrid Approach

Kết hợp Greedy + Grouping:

```javascript
// Group by category first
const grouped = groupBy(items, 'category');

// Apply greedy within each group
Object.keys(grouped).forEach(category => {
  const groupItems = layoutTasks(grouped[category]);
  // ...
});
```

---

## Testing & Validation

### Test Cases

```javascript
describe('Timeline Layout Algorithm', () => {
  test('No overlap on same row', () => {
    const result = layoutTasks(tasks);
    
    result.forEach((task, i) => {
      result.forEach((other, j) => {
        if (i !== j && task.row === other.row) {
          expect(task.endDate < other.startDate || 
                 other.endDate < task.startDate).toBe(true);
        }
      });
    });
  });

  test('Minimal rows used', () => {
    const result = layoutTasks(tasks);
    const maxRow = Math.max(...result.map(t => t.row));
    
    // Verify không thể compact hơn
    expect(canFitInFewerRows(result, maxRow)).toBe(false);
  });

  test('Maintains chronological order', () => {
    const result = layoutTasks(tasks);
    const sortedByStart = [...result].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );
    
    // Original sort order should be preserved for same startDate
    expect(result).toMatchObject(sortedByStart);
  });
});
```

---

## Kết Luận

### Key Takeaways

1. **Thuật toán Greedy First-Fit** là lựa chọn tốt nhất cho:
   - Timeline visualization
   - Gantt charts cơ bản
   - High performance requirements

2. **Độ phức tạp O(n log n)** trong trường hợp trung bình, phù hợp với:
   - Hàng trăm đến hàng nghìn tasks
   - Real-time updates
   - Interactive applications

3. **Quy tắc đơn giản**: 
   > "Task nằm cùng row nếu không overlap, khác row nếu có overlap"

4. **Được sử dụng bởi**: Monday.com, ClickUp, Asana Timeline, và nhiều công cụ khác

### Best Practices

- ✅ Always sort by startDate first
- ✅ Use memoization để tránh recalculate
- ✅ Handle edge cases (null dates, same start/end)
- ✅ Add visual feedback cho overlapping items
- ✅ Consider hybrid approach cho complex requirements

### References

- [Interval Scheduling Problem](https://en.wikipedia.org/wiki/Interval_scheduling)
- [Greedy Algorithms](https://en.wikipedia.org/wiki/Greedy_algorithm)
- [Monday.com Timeline View](https://monday.com/features/timeline-view)
- [Project Management Institute (PMI)](https://www.pmi.org/)
- [ISO 21500 - Project Management](https://www.iso.org/standard/50003.html)

---

**Document Version**: 1.0  
**Last Updated**: December 19, 2025  
**Author**: TDX Development Team
