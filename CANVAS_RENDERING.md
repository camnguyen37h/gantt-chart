# Canvas Rendering Architecture - Timeline Component

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [So sánh DOM vs Canvas](#so-sánh-dom-vs-canvas)
3. [Kiến trúc Canvas Rendering](#kiến-trúc-canvas-rendering)
4. [Chi tiết Implementation](#chi-tiết-implementation)
5. [Quy trình vẽ Canvas](#quy-trình-vẽ-canvas)
6. [Performance Optimizations](#performance-optimizations)
7. [Troubleshooting](#troubleshooting)

---

## Tổng quan

Timeline component hỗ trợ **2 rendering modes**:

### DOM Rendering (Traditional)
```jsx
<Timeline items={data} config={{ renderMode: 'dom' }} />
```
- Sử dụng React components và DOM elements
- Dễ debug, inspect, và style với CSS
- Performance giảm với > 10,000 items

### Canvas Rendering (High Performance)
```jsx
<Timeline items={data} config={{ renderMode: 'canvas' }} />
```
- Sử dụng HTML5 Canvas API
- ECharts-inspired rendering
- Hỗ trợ hàng triệu items
- Không có DOM overhead

---

## So sánh DOM vs Canvas

### DOM Rendering Flow

```
TimelineGrid.jsx
    ↓
1. Render periods (vertical lines) → <div className="timeline-grid-line" />
2. Render rows (horizontal lines) → <div className="timeline-row-line" />
3. Render items → <TimelineItem /> components
    ↓
TimelineItem.jsx
    ↓
4. Range items → <div className="timeline-item-range">
                     <span className="timeline-item-text">{name}</span>
                     <span className="timeline-item-progress">{progress}%</span>
                   </div>
5. Milestones → <div className="timeline-item-milestone">
                    <div className="timeline-item-milestone-marker" />
                    <span className="timeline-item-milestone-label">{name}</span>
                  </div>
6. Current date → <div className="timeline-current-date">
                     <div className="current-date-marker" />
                     <div className="current-date-label">{today}</div>
                   </div>
```

**DOM Output Example:**
```html
<div class="timeline-grid">
  <!-- Grid lines -->
  <div class="timeline-grid-line" style="left: 0px"></div>
  <div class="timeline-grid-line" style="left: 100px"></div>
  
  <!-- Items -->
  <div class="timeline-item-range" style="left: 50px; top: 0px; width: 150px; background: #1890ff">
    <span class="timeline-item-text">Task Name</span>
    <span class="timeline-item-progress">75%</span>
    <div class="timeline-item-progress-bar" style="width: 75%"></div>
  </div>
  
  <!-- Milestone -->
  <div class="timeline-item-milestone" style="left: 200px; top: 40px">
    <div class="timeline-item-milestone-marker"></div>
    <span class="timeline-item-milestone-label">Milestone</span>
  </div>
  
  <!-- Current date -->
  <div class="timeline-current-date" style="left: 120px">
    <div class="current-date-marker"></div>
    <div class="current-date-label">Jan 14</div>
  </div>
</div>
```

---

### Canvas Rendering Flow

```
TimelineCanvas.jsx
    ↓
1. Setup canvas → <canvas ref={canvasRef} />
2. Scale by DPR → canvas.width = width * devicePixelRatio
                   ctx.scale(dpr, dpr)
3. Call draw()
    ↓
canvasRenderer.js → drawTimeline()
    ↓
4. Draw grid → drawGridLines()
    - Vertical lines: ctx.moveTo() → ctx.lineTo()
    - Horizontal lines: ctx.moveTo() → ctx.lineTo()
    
5. Draw items → drawTimelineItems()
    - Range items → drawRangeItem()
        • ctx.roundRect() với shadow
        • ctx.fillText() cho text
        • Progress bar overlay
    - Milestones → drawMilestone()
        • ctx.moveTo/lineTo() cho diamond shape
        • ctx.arc() cho inner circle
        • ctx.fillText() cho label
        
6. Current date → DOM rendering (hybrid approach)
    - Canvas không vẽ current date
    - Sử dụng DOM để overlay trên canvas
```

**Canvas Code Example:**
```javascript
// Grid lines
ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
ctx.beginPath();
ctx.moveTo(left, 0);
ctx.lineTo(left, height);
ctx.stroke();

// Range item
ctx.fillStyle = '#1890ff';
ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
ctx.shadowBlur = 3;
ctx.beginPath();
ctx.roundRect(left, top, width, height, 4); // Rounded corners
ctx.fill();

// Text
ctx.fillStyle = 'white';
ctx.font = '500 13px sans-serif';
ctx.fillText(text, left + 12, top + height / 2);

// Milestone diamond
ctx.beginPath();
ctx.moveTo(centerX, centerY - size / 2); // Top
ctx.lineTo(centerX + size / 2, centerY); // Right
ctx.lineTo(centerX, centerY + size / 2); // Bottom
ctx.lineTo(centerX - size / 2, centerY); // Left
ctx.closePath();
ctx.fill();
```

---

## Kiến trúc Canvas Rendering

### File Structure

```
src/lib/Timeline/
├── components/
│   ├── TimelineCanvas.jsx       ← Main Canvas component
│   ├── TimelineCanvas.css       ← Canvas-specific styles
│   └── Timeline.jsx             ← Mode switcher (DOM/Canvas)
├── utils/
│   ├── canvasRenderer.js        ← Drawing engine
│   └── canvasEventHandler.js    ← Mouse event handling
└── constants.js                 ← RENDER_MODES config
```

### Component Hierarchy

```
Timeline.jsx (Root)
    ↓
    config.renderMode === 'canvas' ?
        ↓                           ↓
    TimelineCanvas.jsx          TimelineGrid.jsx
        ↓
    ┌────────────────┬────────────────┬────────────────┐
    │                │                │                │
<canvas />    <canvas-overlay>  <current-date>   <timeline-header>
(drawing)     (events)          (DOM)            (DOM)
```

### Hybrid Approach

Canvas không vẽ **tất cả**, mà sử dụng **hybrid rendering**:

| Element | Rendering | Lý do |
|---------|----------|-------|
| Grid lines | Canvas | Performance, pixel-perfect |
| Timeline items | Canvas | Performance, smooth animation |
| Item bars | Canvas | Custom shapes, shadows |
| Milestones | Canvas | Diamond shape drawing |
| **Current date line** | **DOM** | Z-index layering, animations |
| **Header** | **DOM** | Better text rendering, interactions |
| **Toolbar** | **DOM** | Buttons, dropdowns |

---

## Chi tiết Implementation

### 1. Canvas Setup (TimelineCanvas.jsx)

```jsx
const TimelineCanvas = ({ timelineData, layoutItems, ... }) => {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const hoveredItemRef = useRef(null);
  
  // Device pixel ratio for sharp rendering
  const dpr = window.devicePixelRatio || 1;
  const canvasWidth = timelineData.totalWidth;
  const canvasHeight = Math.max(gridHeight, 400);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Set physical size (accounting for retina displays)
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    
    // Set CSS size (what user sees)
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    // Scale context for DPR
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Initial draw
    draw();
  }, [canvasWidth, canvasHeight, dpr]);
  
  return (
    <div className="timeline-canvas-container">
      {/* Canvas wrapper for relative positioning */}
      <div className="timeline-canvas-wrapper">
        {/* Drawing canvas */}
        <canvas ref={canvasRef} className="timeline-canvas" />
        
        {/* Event overlay - captures mouse events */}
        <div 
          ref={overlayRef} 
          className="timeline-canvas-overlay"
          style={{ width: canvasWidth, height: canvasHeight }}
        />
        
        {/* Current date (DOM) - proper z-index layering */}
        <div 
          className="timeline-current-date" 
          style={{ left: currentDatePosition }}
        >
          <div className="current-date-marker" />
          <div className="current-date-label">
            {moment().format('MMM DD')}
          </div>
        </div>
      </div>
      
      {/* Header (DOM) - better text rendering */}
      <div className="timeline-header">
        {/* Period labels */}
      </div>
    </div>
  );
};
```

### 2. Drawing Engine (canvasRenderer.js)

#### Main Draw Function

```javascript
export const drawTimeline = (ctx, options) => {
  const {
    timelineData,
    layoutItems,
    currentDatePosition,
    getItemStyle,
    rowHeight,
    enableGrid,
    enableCurrentDate,
    hoveredItem
  } = options;
  
  // Step 1: Draw grid
  if (enableGrid) {
    drawGridLines(ctx, timelineData, layoutItems, rowHeight);
  }
  
  // Step 2: Draw items
  drawTimelineItems(ctx, layoutItems, getItemStyle, hoveredItem);
  
  // Step 3: Current date is handled by DOM
  // (không vẽ ở đây nữa - đã move sang DOM)
};
```

#### Grid Lines Drawing

```javascript
const drawGridLines = (ctx, timelineData, layoutItems, rowHeight) => {
  const { periods, start, baseWidth, totalDays } = timelineData;
  
  ctx.save(); // Save current state
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'; // Light gray
  ctx.lineWidth = 1;
  
  // Vertical lines (periods)
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const daysFromStart = period.start.diff(start, 'days', true);
    const left = daysFromStart * (baseWidth / totalDays);
    
    ctx.beginPath();
    ctx.moveTo(left, 0);              // Start at top
    ctx.lineTo(left, ctx.canvas.height); // Draw to bottom
    ctx.stroke();
  }
  
  // Horizontal lines (rows)
  const maxRow = Math.max(...layoutItems.map(i => i.row || 0));
  for (let i = 0; i <= maxRow; i++) {
    if (i === maxRow) continue; // Skip last line
    
    const top = i * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, top);           // Start at left
    ctx.lineTo(baseWidth, top);   // Draw to right
    ctx.stroke();
  }
  
  ctx.restore(); // Restore previous state
};
```

**Tương đương DOM:**
```jsx
// Vertical lines
{periods.map((period, i) => (
  <div 
    key={i}
    className="timeline-grid-line" 
    style={{ left: `${left}px` }} 
  />
))}

// Horizontal lines
{Array.from({ length: maxRow }).map((_, i) => (
  <div 
    key={i}
    className="timeline-row-line" 
    style={{ top: `${i * rowHeight}px` }} 
  />
))}
```

#### Range Item Drawing

```javascript
const drawRangeItem = (ctx, item, style, isHovered) => {
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const width = parseFloat(style.width);
  const height = parseFloat(style.height);
  
  ctx.save();
  
  // Shadow effect (tương đương box-shadow trong CSS)
  if (isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
  }
  
  // Draw bar background (tương đương background-color)
  ctx.fillStyle = style.backgroundColor || item.color || '#1890ff';
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 4); // Border radius 4px
  ctx.fill();
  
  // Reset shadow for text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Draw text (tương đương <span> trong DOM)
  ctx.fillStyle = 'white';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.textBaseline = 'middle';
  
  const textX = left + 12;
  const textY = top + height / 2;
  const maxTextWidth = width - 24;
  
  if (maxTextWidth > 30) {
    const text = item.name || '';
    const metrics = ctx.measureText(text);
    
    // Text truncation (tương đương text-overflow: ellipsis)
    if (metrics.width > maxTextWidth) {
      let truncated = text;
      while (ctx.measureText(truncated + '...').width > maxTextWidth) {
        truncated = truncated.slice(0, -1);
      }
      ctx.fillText(truncated + '...', textX, textY);
    } else {
      ctx.fillText(text, textX, textY);
    }
    
    // Progress percentage
    if (item.progress !== undefined) {
      const progressText = `${item.progress}%`;
      const progressX = left + width - ctx.measureText(progressText).width - 12;
      ctx.fillText(progressText, progressX, textY);
    }
  }
  
  // Progress bar overlay (tương đương ::after pseudo-element)
  if (item.progress !== undefined) {
    const progressWidth = (width * item.progress) / 100;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.roundRect(left, top, progressWidth, height, 4);
    ctx.fill();
  }
  
  ctx.restore();
};
```

**Tương đương DOM:**
```jsx
<div 
  className="timeline-item-range"
  style={{
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: item.color,
    boxShadow: isHovered 
      ? '0 4px 12px rgba(0,0,0,0.18)' 
      : '0 1px 3px rgba(0,0,0,0.12)',
    borderRadius: '4px'
  }}
>
  <span className="timeline-item-text">
    {text.length > maxChars ? text.slice(0, maxChars) + '...' : text}
  </span>
  {item.progress && (
    <span className="timeline-item-progress">{item.progress}%</span>
  )}
  {item.progress && (
    <div 
      className="timeline-item-progress-bar"
      style={{ width: `${item.progress}%` }}
    />
  )}
</div>
```

#### Milestone Drawing

```javascript
const drawMilestone = (ctx, item, style, isHovered) => {
  const left = parseFloat(style.left);
  const top = parseFloat(style.top);
  const size = 20;
  const centerX = left;
  const centerY = top + 15;
  
  ctx.save();
  
  // Shadow
  ctx.shadowColor = isHovered ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = isHovered ? 8 : 4;
  
  // Draw diamond shape (4 points)
  ctx.fillStyle = item.color || '#722ed1';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size / 2);     // Top
  ctx.lineTo(centerX + size / 2, centerY);     // Right
  ctx.lineTo(centerX, centerY + size / 2);     // Bottom
  ctx.lineTo(centerX - size / 2, centerY);     // Left
  ctx.closePath();
  ctx.fill();
  
  // Inner white circle
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Label below
  ctx.fillStyle = '#262626';
  ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(item.name || '', centerX, centerY + size / 2 + 4, 120);
  
  ctx.restore();
};
```

**Tương đương DOM:**
```jsx
<div 
  className="timeline-item-milestone"
  style={{ left: `${left}px`, top: `${top}px` }}
>
  <div 
    className="timeline-item-milestone-marker"
    style={{
      width: '20px',
      height: '20px',
      backgroundColor: item.color,
      transform: 'rotate(45deg)', // Diamond shape
      boxShadow: isHovered 
        ? '0 0 8px rgba(0,0,0,0.3)' 
        : '0 0 4px rgba(0,0,0,0.2)'
    }}
  >
    <div className="timeline-item-milestone-inner" />
  </div>
  <span className="timeline-item-milestone-label">
    {item.name}
  </span>
</div>
```

### 3. Event Handling (canvasEventHandler.js)

Canvas không có DOM events, phải tự implement hit detection:

```javascript
export const handleCanvasEvents = (options) => {
  const { canvas, layoutItems, onItemClick, onItemHover, ... } = options;
  
  // Get mouse position relative to canvas
  const getMousePosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scrollLeft = canvas.parentElement.scrollLeft || 0;
    const scrollTop = canvas.parentElement.scrollTop || 0;
    
    return {
      x: e.clientX - rect.left + scrollLeft,
      y: e.clientY - rect.top + scrollTop
    };
  };
  
  // Hit detection for rectangles
  const isPointInRect = (x, y, rect) => {
    return x >= rect.left && 
           x <= rect.left + rect.width &&
           y >= rect.top && 
           y <= rect.top + rect.height;
  };
  
  // Hit detection for diamonds (milestones)
  const isPointInMilestone = (x, y, centerX, centerY, size) => {
    const dx = Math.abs(x - centerX);
    const dy = Math.abs(y - centerY);
    return dx / (size / 2) + dy / (size / 2) <= 1;
  };
  
  // Find item at position (reverse order for z-index)
  const findItemAtPosition = (x, y) => {
    for (let i = layoutItems.length - 1; i >= 0; i--) {
      const item = layoutItems[i];
      const style = getItemStyle(item);
      
      if (isMilestone(item)) {
        const centerX = parseFloat(style.left);
        const centerY = parseFloat(style.top) + 15;
        if (isPointInMilestone(x, y, centerX, centerY, 20)) {
          return item;
        }
      } else {
        const rect = {
          left: parseFloat(style.left),
          top: parseFloat(style.top),
          width: parseFloat(style.width),
          height: parseFloat(style.height)
        };
        if (isPointInRect(x, y, rect)) {
          return item;
        }
      }
    }
    return null;
  };
  
  // Mouse move handler
  const handleMouseMove = (e) => {
    const { x, y } = getMousePosition(e);
    const item = findItemAtPosition(x, y);
    
    if (item !== hoveredItem) {
      hoveredItem = item;
      onItemHover(item);
      canvas.style.cursor = item ? 'pointer' : 'default';
      requestAnimationFrame(() => draw()); // Redraw with hover state
    }
  };
  
  // Click handler
  const handleClick = (e) => {
    const { x, y } = getMousePosition(e);
    const item = findItemAtPosition(x, y);
    
    if (item) {
      onItemClick(item);
    }
  };
  
  // Attach events to overlay (not canvas)
  overlay.addEventListener('mousemove', handleMouseMove);
  overlay.addEventListener('click', handleClick);
  
  // Cleanup
  return () => {
    overlay.removeEventListener('mousemove', handleMouseMove);
    overlay.removeEventListener('click', handleClick);
  };
};
```

**So sánh với DOM events:**
```jsx
// DOM: Built-in event handling
<div 
  className="timeline-item"
  onClick={(e) => onItemClick(item)}
  onMouseEnter={() => setHovered(true)}
  style={{ cursor: 'pointer' }}
>
  {item.name}
</div>

// Canvas: Manual hit detection
overlay.addEventListener('click', (e) => {
  const { x, y } = getMousePosition(e);
  const item = findItemAtPosition(x, y); // Custom logic
  if (item) onItemClick(item);
});
```

---

## Quy trình vẽ Canvas

### Sequence Diagram

```
User Action                 Component               Renderer                Canvas
    │                           │                       │                      │
    │──── Mount ────────────────►│                       │                      │
    │                           │                       │                      │
    │                           │──── Setup ────────────►│                      │
    │                           │                       │                      │
    │                           │                       │──── Create ─────────►│
    │                           │                       │   (width × DPR)      │
    │                           │                       │                      │
    │                           │                       │◄──── Ready ──────────│
    │                           │                       │                      │
    │                           │──── draw() ───────────►│                      │
    │                           │                       │                      │
    │                           │                       │──── Clear ──────────►│
    │                           │                       │   clearRect()        │
    │                           │                       │                      │
    │                           │                       │──── Grid ───────────►│
    │                           │                       │   drawGridLines()    │
    │                           │                       │                      │
    │                           │                       │──── Items ──────────►│
    │                           │                       │   drawTimelineItems()│
    │                           │                       │                      │
    │                           │◄──── Done ────────────│                      │
    │                           │                       │                      │
    │──── Hover Item ───────────►│                       │                      │
    │                           │                       │                      │
    │                           │──── Find Item ────────►│                      │
    │                           │   (hit detection)     │                      │
    │                           │                       │                      │
    │                           │◄──── Found ───────────│                      │
    │                           │                       │                      │
    │                           │──── Redraw ───────────►│                      │
    │                           │   (with hover state)  │                      │
    │                           │                       │                      │
    │                           │                       │──── Clear ──────────►│
    │                           │                       │                      │
    │                           │                       │──── Grid ───────────►│
    │                           │                       │                      │
    │                           │                       │──── Items ──────────►│
    │                           │                       │   (hovered = true)   │
    │                           │                       │                      │
    │◄──── Cursor: pointer ─────│                       │                      │
```

### Step-by-Step Drawing

```javascript
// 1. Clear canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

// 2. Draw grid lines
ctx.save();
ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
// ... vertical lines
// ... horizontal lines
ctx.restore();

// 3. Draw each item
for (let item of layoutItems) {
  ctx.save();
  
  // 3a. Set shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 3;
  
  // 3b. Draw shape
  ctx.fillStyle = item.color;
  ctx.roundRect(left, top, width, height, 4);
  ctx.fill();
  
  // 3c. Draw text
  ctx.fillStyle = 'white';
  ctx.fillText(item.name, x, y);
  
  ctx.restore();
}

// 4. Current date is DOM (not drawn here)
```

---

## Performance Optimizations

### 1. Device Pixel Ratio (DPR)

**Problem:** Canvas trên retina displays (MacBook, iPhone) bị blurry

**Solution:**
```javascript
const dpr = window.devicePixelRatio || 1;

// Physical canvas size (actual pixels)
canvas.width = logicalWidth * dpr;
canvas.height = logicalHeight * dpr;

// CSS size (what user sees)
canvas.style.width = `${logicalWidth}px`;
canvas.style.height = `${logicalHeight}px`;

// Scale drawing context
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

// Now draw at logical coordinates
ctx.fillRect(10, 10, 100, 50); // Will be sharp on retina
```

### 2. RequestAnimationFrame

**Problem:** Frequent redraws cause jank

**Solution:**
```javascript
let animationFrame = null;

const scheduleRedraw = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  animationFrame = requestAnimationFrame(() => {
    draw();
    animationFrame = null;
  });
};

// Instead of: draw() (immediate)
// Use: scheduleRedraw() (batched, 60fps)
```

### 3. Dirty Region Optimization

**Problem:** Redrawing entire canvas is expensive

**Solution** (not yet implemented, can add):
```javascript
const dirtyRegions = [];

const invalidateRegion = (x, y, width, height) => {
  dirtyRegions.push({ x, y, width, height });
  scheduleRedraw();
};

const draw = () => {
  if (dirtyRegions.length === 0) {
    // Full redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAll();
  } else {
    // Partial redraw
    for (let region of dirtyRegions) {
      ctx.clearRect(region.x, region.y, region.width, region.height);
      drawRegion(region);
    }
    dirtyRegions.length = 0;
  }
};
```

### 4. Layer Separation

**Current architecture:**
```
Canvas Layer (items, grid)
    ↓
DOM Layer (current date, header)
```

**Why hybrid?**
- Canvas: Fast rendering, millions of items
- DOM: Better text quality, CSS animations, z-index control

### 5. Text Measurement Caching

**Problem:** `ctx.measureText()` is expensive

**Optimization:**
```javascript
const textMetricsCache = new Map();

const measureText = (ctx, text) => {
  if (textMetricsCache.has(text)) {
    return textMetricsCache.get(text);
  }
  
  const metrics = ctx.measureText(text);
  textMetricsCache.set(text, metrics);
  return metrics;
};
```

### 6. Off-screen Canvas (Future)

```javascript
// Pre-render static elements
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

// Draw grid once
drawGridLines(offscreenCtx, ...);

// Main render
const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offscreenCanvas, 0, 0); // Paste pre-rendered grid
  drawTimelineItems(ctx, ...); // Only draw dynamic items
};
```

---

## Troubleshooting

### Issue 1: Blurry canvas trên retina displays

**Symptom:** Text và lines bị mờ

**Fix:**
```javascript
// ✅ CORRECT
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);

// ❌ WRONG
canvas.width = width;
canvas.height = height;
// No scaling
```

### Issue 2: Events không hoạt động

**Symptom:** Click vào items không trigger onClick

**Fix:**
```javascript
// ✅ CORRECT: Events on overlay, not canvas
<div className="timeline-canvas-wrapper">
  <canvas ref={canvasRef} /> {/* No events */}
  <div 
    ref={overlayRef} 
    className="timeline-canvas-overlay" 
    onMouseMove={handleMouseMove}
    onClick={handleClick}
  />
</div>

// ❌ WRONG: Events on canvas
<canvas 
  ref={canvasRef}
  onClick={handleClick} // Won't work properly
/>
```

### Issue 3: Current date bị che

**Symptom:** Current date line không hiển thị hoặc bị items đè lên

**Fix:**
```javascript
// ✅ CORRECT: Current date as DOM (not canvas)
// In canvasRenderer.js - REMOVE drawCurrentDateLine()

// In TimelineCanvas.jsx - ADD DOM element
<div 
  className="timeline-current-date" 
  style={{ 
    left: currentDatePosition,
    zIndex: 50 // Above canvas
  }}
>
  <div className="current-date-marker" />
  <div className="current-date-label">{today}</div>
</div>
```

### Issue 4: Scroll không smooth

**Symptom:** Canvas không scroll hoặc bị lag

**Fix:**
```css
/* ✅ CORRECT */
.timeline-canvas-wrapper {
  position: relative;
  overflow: visible; /* Don't block scroll */
}

.timeline-canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5; /* Above canvas, below current date */
  pointer-events: auto; /* Capture events */
}

/* ❌ WRONG */
.timeline-canvas-overlay {
  position: fixed; /* Blocks scroll */
  width: 100%;
  height: 100%;
  z-index: 9999; /* Too high */
}
```

### Issue 5: Performance degradation với nhiều items

**Symptom:** Lag khi hover hoặc scroll

**Optimization checklist:**
```javascript
// 1. Use RAF for redraws
requestAnimationFrame(() => draw());

// 2. Debounce hover events
const debouncedHover = debounce(handleHover, 16); // 60fps

// 3. Limit redraw area
ctx.clearRect(dirtyX, dirtyY, dirtyWidth, dirtyHeight); // Not entire canvas

// 4. Cache text metrics
const metrics = measureTextCached(ctx, text);

// 5. Use off-screen canvas for static elements
ctx.drawImage(gridCanvas, 0, 0);
```

---

## Kết luận

### Canvas Rendering Benefits

✅ **Performance:** Hỗ trợ hàng triệu items  
✅ **Smooth:** 60fps animations  
✅ **Pixel-perfect:** Custom shapes, shadows  
✅ **Memory-efficient:** No DOM overhead  

### Tradeoffs

❌ **Complexity:** Manual event handling  
❌ **Debugging:** Không inspect được như DOM  
❌ **Accessibility:** Cần thêm ARIA attributes  
❌ **Text rendering:** Không sắc nét như DOM (đã fix bằng DPR)  

### Hybrid Approach = Best of Both Worlds

- Canvas cho **performance** (items, grid)
- DOM cho **quality** (text, animations, interactions)

### Migration Path

```javascript
// Start with DOM
<Timeline items={data} config={{ renderMode: 'dom' }} />

// Switch to Canvas when needed
<Timeline items={data} config={{ renderMode: 'canvas' }} />

// Fallback is seamless
if (canvas.getContext === undefined) {
  renderMode = 'dom'; // Automatic fallback
}
```

---

## Reference Files

- **TimelineCanvas.jsx** - Main Canvas component
- **canvasRenderer.js** - Drawing engine (308 lines)
- **canvasEventHandler.js** - Event handling
- **TimelineCanvas.css** - Canvas-specific styles
- **Timeline.jsx** - Mode switcher
- **constants.js** - `RENDER_MODES` configuration

**Last Updated:** January 14, 2026  
**Canvas Rendering Version:** 1.0.0
