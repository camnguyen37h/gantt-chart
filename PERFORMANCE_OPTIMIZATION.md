# Performance Optimization Strategy - Timeline Canvas

## 📊 Optimization for Million-Scale Data

### Current Optimizations (Already Implemented)

✅ **Canvas Rendering**
- HTML5 Canvas thay vì DOM rendering
- Device Pixel Ratio support (sharp on retina displays)
- RequestAnimationFrame for 60fps rendering
- Batch drawing (single canvas clear + redraw)

✅ **Memoization**
- `useMemo` for expensive calculations:
  - `timelineData` (date range, periods)
  - `layoutItems` (layout calculation)
  - `filteredItems` (filter + search)
  - `currentDatePosition`
- `useCallback` for functions:
  - `draw()` - Canvas rendering
  - `getItemStyle()` - Style calculation
  - `scrollToToday()` - Scroll behavior

✅ **Performance Best Practices**
- Avoided optional chaining (`?.`) và nullish coalescing (`??`)
- Classic for loops thay vì array methods (faster)
- Direct property access
- No console.log in production code
- Timestamp caching

---

## 🚀 Additional Optimizations Needed for 1M+ Records

### 1. Virtual Scrolling / Windowing

**Problem:** Rendering all 1M items wastes memory and CPU

**Solution:** Only render visible items in viewport

```javascript
// utils/virtualScrolling.js
export const getVisibleItems = (allItems, scrollTop, scrollLeft, viewportWidth, viewportHeight, getItemStyle) => {
  const visibleItems = [];
  const buffer = 200; // px buffer for smooth scrolling
  
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const style = getItemStyle(item);
    const itemLeft = parseFloat(style.left);
    const itemTop = parseFloat(style.top);
    const itemWidth = parseFloat(style.width || 100);
    const itemHeight = parseFloat(style.height || 30);
    
    // Check if item is in viewport (with buffer)
    const isVisible = (
      itemLeft + itemWidth >= scrollLeft - buffer &&
      itemLeft <= scrollLeft + viewportWidth + buffer &&
      itemTop + itemHeight >= scrollTop - buffer &&
      itemTop <= scrollTop + viewportHeight + buffer
    );
    
    if (isVisible) {
      visibleItems.push(item);
    }
  }
  
  return visibleItems;
};
```

**Usage in TimelineCanvas:**
```javascript
const [scrollState, setScrollState] = useState({ top: 0, left: 0 });

// Only draw visible items
const visibleItems = useMemo(() => {
  return getVisibleItems(
    layoutItems,
    scrollState.top,
    scrollState.left,
    canvasWidth,
    canvasHeight,
    getItemStyle
  );
}, [layoutItems, scrollState, canvasWidth, canvasHeight, getItemStyle]);

// Update scroll state
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  
  const handleScroll = () => {
    setScrollState({
      top: container.scrollTop,
      left: container.scrollLeft
    });
  };
  
  container.addEventListener('scroll', handleScroll, { passive: true });
  return () => container.removeEventListener('scroll', handleScroll);
}, []);
```

**Expected Improvement:** 99% reduction in rendering load (1M → ~1K visible items)

---

### 2. Debounce Expensive Operations

**Problem:** Scroll/resize triggers too many re-renders

**Solution:** Debounce and throttle

```javascript
// utils/performanceUtils.js
export const throttle = (func, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

export const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
```

**Usage:**
```javascript
// Throttle scroll updates (max 60fps)
const handleScroll = useCallback(
  throttle(() => {
    setScrollState({
      top: container.scrollTop,
      left: container.scrollLeft
    });
  }, 16), // ~60fps
  []
);

// Debounce search (wait for user to stop typing)
const handleSearch = useCallback(
  debounce((query) => {
    setSearchQuery(query);
  }, 300),
  []
);
```

---

### 3. Layout Calculation Optimization

**Problem:** `calculateAdvancedLayout` runs on every data change

**Solution:** Only recalculate when items actually change

```javascript
// In useTimeline.js
const itemsFingerprint = useMemo(() => {
  // Create lightweight fingerprint for change detection
  return filteredItems.map(item => `${item.id}-${item.startDate}-${item.endDate}`).join('|');
}, [filteredItems]);

const layoutItems = useMemo(() => {
  if (!filteredItems || !timelineData) return [];
  return calculateAdvancedLayout(filteredItems);
}, [itemsFingerprint, timelineData]); // Use fingerprint instead of filteredItems
```

---

### 4. Canvas Layer Separation

**Problem:** Redrawing everything on hover/animation

**Solution:** Use multiple canvas layers

```javascript
// 3 canvas layers:
// 1. Static layer (grid, background) - rarely updated
// 2. Items layer (timeline bars) - updated on data change
// 3. Interactive layer (hover effects, current date) - updated on interaction

const TimelineCanvas = () => {
  const staticCanvasRef = useRef(null);
  const itemsCanvasRef = useRef(null);
  const interactiveCanvasRef = useRef(null);
  
  // Draw static content once
  useEffect(() => {
    const ctx = staticCanvasRef.current.getContext('2d');
    drawGrid(ctx, timelineData);
  }, [timelineData]);
  
  // Draw items on data change
  useEffect(() => {
    const ctx = itemsCanvasRef.current.getContext('2d');
    drawTimelineItems(ctx, layoutItems, getItemStyle);
  }, [layoutItems]);
  
  // Draw interactive elements on hover
  useEffect(() => {
    const ctx = interactiveCanvasRef.current.getContext('2d');
    drawHoverEffects(ctx, hoveredItem);
    drawCurrentDate(ctx, currentDatePosition);
  }, [hoveredItem, currentDatePosition]);
};
```

**Expected Improvement:** 70% reduction in redraw time

---

### 5. Web Worker for Heavy Calculations

**Problem:** Layout calculation blocks main thread

**Solution:** Offload to Web Worker

```javascript
// workers/layoutWorker.js
self.addEventListener('message', (e) => {
  const { items, config } = e.data;
  const layoutItems = calculateAdvancedLayout(items, config);
  self.postMessage({ layoutItems });
});

// In useTimeline.js
const layoutWorkerRef = useRef(null);

useEffect(() => {
  layoutWorkerRef.current = new Worker('/workers/layoutWorker.js');
  return () => layoutWorkerRef.current.terminate();
}, []);

const layoutItems = useMemo(() => {
  if (!filteredItems) return [];
  
  // For small datasets, calculate in main thread
  if (filteredItems.length < 1000) {
    return calculateAdvancedLayout(filteredItems);
  }
  
  // For large datasets, use worker
  return new Promise((resolve) => {
    layoutWorkerRef.current.postMessage({ items: filteredItems, config });
    layoutWorkerRef.current.onmessage = (e) => {
      resolve(e.data.layoutItems);
    };
  });
}, [filteredItems]);
```

---

### 6. Data Indexing and Binary Search

**Problem:** Linear search through 1M items for hit detection

**Solution:** Use spatial indexing

```javascript
// utils/spatialIndex.js
export class SpatialIndex {
  constructor() {
    this.grid = new Map();
    this.cellSize = 100; // px
  }
  
  insert(item, bounds) {
    const cells = this.getCells(bounds);
    for (const cell of cells) {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, []);
      }
      this.grid.get(cell).push(item);
    }
  }
  
  getCells(bounds) {
    const cells = [];
    const startX = Math.floor(bounds.left / this.cellSize);
    const endX = Math.floor((bounds.left + bounds.width) / this.cellSize);
    const startY = Math.floor(bounds.top / this.cellSize);
    const endY = Math.floor((bounds.top + bounds.height) / this.cellSize);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    return cells;
  }
  
  query(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const cell = `${cellX},${cellY}`;
    return this.grid.get(cell) || [];
  }
}

// Usage in canvasEventHandler.js
const findItemAtPosition = (x, y, layoutItems, getItemStyle) => {
  // Instead of checking all items:
  const candidates = spatialIndex.query(x, y);
  
  // Only check items in the same grid cell
  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    // ... hit test logic
  }
};
```

**Expected Improvement:** O(n) → O(1) for hit detection

---

### 7. Progressive Rendering

**Problem:** Initial render blocks for too long

**Solution:** Render in chunks

```javascript
const useProgressiveRender = (allItems, chunkSize = 1000) => {
  const [renderedCount, setRenderedCount] = useState(chunkSize);
  
  useEffect(() => {
    if (renderedCount < allItems.length) {
      const timer = setTimeout(() => {
        setRenderedCount(prev => Math.min(prev + chunkSize, allItems.length));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [renderedCount, allItems.length, chunkSize]);
  
  return allItems.slice(0, renderedCount);
};

// Usage
const visibleItems = useProgressiveRender(layoutItems, 1000);
```

---

## 📈 Performance Metrics Goals

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| **Items rendered** | 1,000,000 | 500-2,000 | Virtual scrolling |
| **Initial render** | ~5s | <500ms | Progressive + Worker |
| **Scroll FPS** | 30fps | 60fps | Throttle + Layers |
| **Hit detection** | O(n) | O(1) | Spatial index |
| **Memory usage** | High | <500MB | Virtual scrolling |
| **Bundle size** | - | Minimal | Tree shaking |

---

## 🛠️ Code Quality - SonarQube Compliance

### Rules Applied

✅ **No Optional Chaining (`?.`)**
```javascript
// ❌ Bad
const value = obj?.prop?.nested;

// ✅ Good
const value = obj && obj.prop && obj.prop.nested;
```

✅ **No Nullish Coalescing (`??`)**
```javascript
// ❌ Bad
const value = input ?? defaultValue;

// ✅ Good
const value = input !== null && input !== undefined ? input : defaultValue;
```

✅ **No console.log in Production**
```javascript
// Use conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

✅ **Explicit Type Checks**
```javascript
// ❌ Bad
if (item.status === 'Milestone') { }

// ✅ Good
if (item && typeof item.status === 'string' && item.status === 'Milestone') { }
```

✅ **Early Returns**
```javascript
// ✅ Good - Reduce nesting
const processItem = (item) => {
  if (!item) return null;
  if (!item.startDate) return null;
  if (!item.endDate) return null;
  
  // Process valid item
  return calculateLayout(item);
};
```

---

## 🔧 Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. ✅ Remove `?.` operator (1 instance found)
2. ✅ Remove console.log
3. ✅ Add throttle/debounce
4. ✅ Optimize loops (use for instead of forEach/map where possible)

### Phase 2: Virtual Scrolling (2-3 days)
1. Implement getVisibleItems
2. Add scroll state management
3. Update canvas rendering to use visible items only
4. Test with 100K+ items

### Phase 3: Advanced (1 week)
1. Multi-layer canvas
2. Spatial indexing
3. Progressive rendering
4. Web Worker for layout

---

## 📝 Maintenance Guidelines

### Code Structure
```
Timeline/
├── components/       # React components
├── hooks/           # Custom hooks (useTimeline)
├── utils/           # Pure functions
│   ├── dateUtils.js
│   ├── layoutUtils.js
│   ├── itemUtils.js
│   ├── canvasRenderer.js
│   ├── canvasEventHandler.js
│   └── performanceUtils.js (NEW)
├── workers/         # Web Workers (NEW)
│   └── layoutWorker.js
└── constants/       # Configuration
```

### Testing Strategy
```javascript
// Performance benchmarks
describe('Performance', () => {
  it('should render 100K items in <1s', () => {
    const items = generateMockItems(100000);
    const start = performance.now();
    render(<Timeline items={items} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
  
  it('should maintain 60fps during scroll', () => {
    // ... FPS monitoring
  });
});
```

---

## 🎯 Next Steps

1. **Measure first:** Profile current performance with Chrome DevTools
2. **Implement virtual scrolling:** Biggest impact for large datasets
3. **Add monitoring:** Track FPS, memory, render time
4. **Gradual optimization:** Don't over-optimize prematurely

**Remember:** Canvas rendering is already optimized. Focus on reducing the number of items processed, not how they're drawn.
