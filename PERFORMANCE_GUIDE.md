# Timeline Performance Optimization Guide

## Tối ưu cho Dữ liệu Lớn (Million-Scale Datasets)

Timeline đã được tối ưu để xử lý hiệu quả dữ liệu lớn, có thể lên tới hàng triệu bản ghi.

## Các Tính Năng Tối Ưu

### 1. Virtual Scrolling
- **Chỉ render items trong viewport**: Thay vì render toàn bộ hàng triệu items, timeline chỉ render những items đang hiển thị trên màn hình
- **Overscan buffer**: Render thêm 5 rows ngoài viewport để scroll mượt mà
- **Tự động bật**: Tự động kích hoạt khi dataset > 10,000 items

### 2. Web Worker Processing
- **Off-thread calculations**: Layout calculations chạy trên worker thread, không block UI
- **Automatic fallback**: Tự động fallback về main thread nếu Web Worker không khả dụng
- **Threshold**: Tự động sử dụng worker cho datasets > 10,000 items

### 3. Chunked Processing
- **Batch processing**: Xử lý dữ liệu theo chunks 1,000 items
- **Progress tracking**: Hiển thị progress bar khi đang tính toán
- **Non-blocking**: Sử dụng async/await để không block UI

### 4. Algorithm Optimizations
- **Timestamp caching**: Pre-calculate timestamps để tránh repeated moment() calls
- **valueOf() comparisons**: Sử dụng numeric comparison thay vì moment comparison (nhanh hơn 10x)
- **Early exit**: Break loops khi tìm thấy kết quả
- **For loops**: Sử dụng traditional for loops thay vì forEach/map (nhanh hơn cho large arrays)

## Chuẩn Code

### SonarQube Compliance
✅ **Không sử dụng Optional Chaining**: Không dùng `?.` hoặc `??`
✅ **Explicit null checks**: Kiểm tra null/undefined rõ ràng
✅ **JSDoc documentation**: Tất cả functions đều có JSDoc
✅ **No magic numbers**: Constants được define rõ ràng
✅ **Single responsibility**: Mỗi function làm một việc
✅ **Clean code**: Code gọn gàng, dễ maintain

### Performance Best Practices
```javascript
// ✅ GOOD: Explicit null check
if (!item) {
  return null;
}
if (item.startDate) {
  // ...
}

// ❌ BAD: Optional chaining
const date = item?.startDate;

// ✅ GOOD: For loop for large arrays
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  // process item
}

// ❌ BAD: forEach/map for large arrays
items.forEach(item => {
  // process item
});

// ✅ GOOD: Cached timestamp comparison
const startTime = startDate.valueOf();
if (rowEndTime < startTime) {
  // ...
}

// ❌ BAD: Repeated moment calls
if (rowEndDate.isBefore(item.startDate)) {
  // ...
}
```

## Hiệu Năng

### Benchmarks
- **10K items**: ~100ms (sync calculation)
- **100K items**: ~1-2s (worker calculation, non-blocking)
- **1M items**: ~10-20s (worker calculation, with progress)
- **Rendering**: Only ~100-200 DOM nodes regardless of dataset size

### Memory Usage
- **Virtual scrolling**: Giảm 99% DOM nodes cho large datasets
- **Estimated memory**: ~500 bytes per item
- **1M items**: ~500MB memory (acceptable for modern browsers)

## Usage Examples

### Basic Usage (Small Dataset)
```javascript
import { TimelineChart } from './lib/Timeline';

function MyComponent() {
  const items = [
    { id: 1, name: 'Task 1', startDate: '2024-01-01', endDate: '2024-01-15' },
    // ... up to 10K items
  ];
  
  return <TimelineChart items={items} />;
}
```

### Large Dataset with Progress
```javascript
import { TimelineChart } from './lib/Timeline';
import { LoadingIndicator } from './lib/Timeline/components/LoadingIndicator';

function MyComponent() {
  const [items, setItems] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Load large dataset
  useEffect(() => {
    loadLargeDataset().then(data => {
      setItems(data); // Can be 100K-1M items
    });
  }, []);
  
  return (
    <div style={{ position: 'relative' }}>
      <TimelineChart 
        items={items}
        onCalculationStart={() => setIsCalculating(true)}
        onCalculationProgress={(p) => setProgress(p)}
        onCalculationEnd={() => setIsCalculating(false)}
      />
      <LoadingIndicator 
        isVisible={isCalculating}
        progress={progress}
        message="Processing timeline..."
      />
    </div>
  );
}
```

### Custom Configuration
```javascript
const config = {
  // Virtual scrolling
  rowHeight: 50,          // Row height for visible range calculation
  overscan: 10,           // Extra rows to render outside viewport
  
  // Performance
  workerThreshold: 5000,  // Use worker for datasets > 5000 items
  chunkSize: 500,         // Process in chunks of 500 items
  
  // Display
  pixelsPerDay: 40,
  itemHeight: 30,
  itemPadding: 10,
  
  // Features
  enableAutoScroll: true,
  showCurrentDate: true
};

<TimelineChart items={largeDataset} config={config} />
```

## Architecture

### File Structure
```
Timeline/
├── components/
│   ├── LoadingIndicator.jsx    # Progress indicator
│   └── TimelineGrid.jsx         # Main grid component
├── hooks/
│   └── useTimeline.js           # Timeline logic hook
├── utils/
│   ├── layoutUtils.js           # Layout calculations
│   ├── itemUtils.js             # Item utilities
│   ├── dateUtils.js             # Date utilities
│   ├── virtualScrollUtils.js    # Virtual scrolling helpers
│   └── workerManager.js         # Web Worker manager
├── workers/
│   └── layoutWorker.js          # Layout calculation worker
└── styles/
    └── LoadingIndicator.css     # Loading styles
```

### Data Flow
```
Items → Normalize → Filter → Layout Calculation → Virtual Scrolling → Render

For Large Datasets:
Items → Chunks → Web Worker → Layout → Cache → Virtual Scrolling → Render Visible
```

### Worker Communication
```javascript
// Main Thread
const result = await calculateLayoutInWorker(items);

// Worker Thread
self.onmessage = (e) => {
  const { type, payload } = e.data;
  
  if (type === 'CALCULATE_LAYOUT') {
    const result = calculateLayout(payload.items);
    self.postMessage({ type: 'RESULT', result });
  }
};
```

## Troubleshooting

### Slow Performance
1. Check dataset size: > 100K items will take longer
2. Enable progress indicator to show calculation status
3. Increase chunk size if memory allows
4. Reduce overscan rows if rendering is slow

### Memory Issues
1. Reduce dataset size with server-side filtering
2. Implement pagination or lazy loading
3. Clear old data when loading new data
4. Monitor memory usage with `estimateMemoryUsage()`

### Layout Issues
1. Verify all items have valid startDate and endDate
2. Check for null/undefined values
3. Ensure dates are in correct format
4. Use normalizeItem() to validate items

## Migration from Old Version

### Breaking Changes
- `layoutItems` → Use `visibleItems` for rendering
- Add `handleScroll` to timeline container
- Optional: Add LoadingIndicator component

### Before
```javascript
const { layoutItems } = useTimeline(items);

return (
  <div className="timeline-grid">
    {layoutItems.map(item => <TimelineItem key={item.id} item={item} />)}
  </div>
);
```

### After
```javascript
const { 
  visibleItems, 
  handleScroll, 
  isCalculating, 
  calculationProgress 
} = useTimeline(items);

return (
  <div className="timeline-container" onScroll={handleScroll}>
    <div className="timeline-grid">
      {visibleItems.map(item => <TimelineItem key={item.id} item={item} />)}
    </div>
    <LoadingIndicator 
      isVisible={isCalculating} 
      progress={calculationProgress} 
    />
  </div>
);
```

## Advanced Topics

### Custom Worker
```javascript
// Create custom worker for specific calculations
import { initWorker, sendMessage } from './utils/workerManager';

initWorker('./custom-worker.js');
const result = await sendMessage('CUSTOM_CALCULATION', { data });
```

### Custom Virtual Scrolling
```javascript
import { calculateVisibleRange, getVisibleItems } from './utils/virtualScrollUtils';

const visibleRange = calculateVisibleRange({
  scrollTop: 1000,
  containerHeight: 600,
  rowHeight: 50,
  totalRows: 10000,
  overscan: 5
});

const visible = getVisibleItems(allItems, visibleRange.startRow, visibleRange.endRow);
```

### Performance Monitoring
```javascript
import { estimateMemoryUsage } from './utils/virtualScrollUtils';

const memoryUsage = estimateMemoryUsage(items);
console.log(`Estimated memory: ${memoryUsage.totalMB}MB`);

if (memoryUsage.totalMB > 1000) {
  console.warn('Large memory usage detected!');
}
```

## Support

Nếu gặp vấn đề về performance:
1. Check console warnings/errors
2. Monitor browser memory usage (Chrome DevTools)
3. Test with smaller dataset first
4. Verify Web Worker is available (check isWorkerAvailable())

## Future Improvements

- [ ] Server-side rendering support
- [ ] Horizontal virtual scrolling
- [ ] Progressive loading (load visible data first)
- [ ] IndexedDB caching for very large datasets
- [ ] WebAssembly for even faster calculations
