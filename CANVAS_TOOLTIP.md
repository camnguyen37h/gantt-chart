# Canvas Tooltip Implementation Guide

## 📋 Tổng quan

Tooltip cho Canvas Timeline sử dụng **Hybrid Approach**: DOM tooltip overlay trên Canvas thay vì vẽ trực tiếp bằng Canvas API.

### Tại sao dùng DOM thay vì Canvas?

| Aspect | DOM Tooltip ✅ | Canvas Tooltip ❌ |
|--------|---------------|------------------|
| **Styling** | Dễ dàng với CSS | Phải vẽ tay từng pixel |
| **Rich content** | Support HTML/Images | Chỉ text và shapes |
| **Performance** | Tốt (1 element) | Phải redraw mỗi frame |
| **Animations** | CSS transitions | Phải code animation |
| **Positioning** | Auto với CSS | Phải tính toán manual |

---

## 🏗️ Architecture

### Component Structure

```
TimelineCanvas.jsx
    ↓
┌───────────────────────────────────────┐
│ timeline-canvas-wrapper               │
│   ┌─────────────────────────────┐     │
│   │ <canvas />                  │     │ ← Drawing layer
│   └─────────────────────────────┘     │
│   ┌─────────────────────────────┐     │
│   │ canvas-overlay              │     │ ← Event layer (z-index: 5)
│   └─────────────────────────────┘     │
│   ┌─────────────────────────────┐     │
│   │ current-date                │     │ ← Date marker (z-index: 50)
│   └─────────────────────────────┘     │
│   ┌─────────────────────────────┐     │
│   │ timeline-canvas-tooltip     │     │ ← Tooltip (z-index: 100)
│   │  ┌───────────────────────┐  │     │
│   │  │ Task Name             │  │     │
│   │  ├───────────────────────┤  │     │
│   │  │ Status: Implementing  │  │     │
│   │  │ Start:  Jan 01, 2024  │  │     │
│   │  │ End:    Mar 31, 2024  │  │     │
│   │  │ Progress: 75%         │  │     │
│   │  └───────────────────────┘  │     │
│   └─────────────────────────────┘     │
└───────────────────────────────────────┘
```

### Z-Index Layering

```
Layer 5: Tooltip                (z-index: 100) ← Highest
Layer 4: Current date label     (z-index: 60)
Layer 3: Current date marker    (z-index: 50)
Layer 2: Overlay (events)       (z-index: 5)
Layer 1: Canvas (drawing)       (z-index: auto)
```

---

## 📝 Implementation Details

### 1. JSX Structure (TimelineCanvas.jsx)

```jsx
const TimelineCanvas = ({ ... }) => {
  const tooltipRef = useRef(null); // ← New ref for tooltip
  
  return (
    <div className="timeline-canvas-wrapper">
      {/* Canvas layer */}
      <canvas ref={canvasRef} />
      
      {/* Event overlay */}
      <div ref={overlayRef} className="timeline-canvas-overlay" />
      
      {/* Tooltip - Initially hidden */}
      <div ref={tooltipRef} className="timeline-canvas-tooltip">
        <div className="timeline-canvas-tooltip-content">
          <div className="tooltip-title"></div>      {/* ← Task name */}
          <div className="tooltip-details"></div>    {/* ← Info rows */}
        </div>
      </div>
    </div>
  );
};
```

### 2. Event Handler Updates (canvasEventHandler.js)

#### Show Tooltip Function

```javascript
const showTooltip = (item, event) => {
  if (!tooltip) return;

  // 1. Get mouse position relative to container
  const rect = container.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // 2. Update tooltip content
  const titleEl = tooltip.querySelector('.tooltip-title');
  const detailsEl = tooltip.querySelector('.tooltip-details');
  
  titleEl.textContent = item.name || 'Untitled';
  
  detailsEl.innerHTML = `
    <div class="tooltip-row">
      <span class="tooltip-label">Status:</span> 
      <span class="tooltip-value">${item.status}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Start:</span> 
      <span class="tooltip-value">${startDate}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">End:</span> 
      <span class="tooltip-value">${endDate}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Progress:</span> 
      <span class="tooltip-value">${item.progress}%</span>
    </div>
  `;

  // 3. Show tooltip (initially hidden for positioning)
  tooltip.style.display = 'block';
  tooltip.style.opacity = '0';

  // 4. Position tooltip (after render to get dimensions)
  requestAnimationFrame(() => {
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Default position: right and below mouse
    let left = mouseX + 15;
    let top = mouseY + 10;

    // Adjust if tooltip goes off-screen to the right
    if (left + tooltipRect.width > containerRect.width) {
      left = mouseX - tooltipRect.width - 15; // Show on left
    }

    // Adjust if tooltip goes off-screen to the bottom
    if (top + tooltipRect.height > containerRect.height) {
      top = mouseY - tooltipRect.height - 10; // Show above
    }

    // Keep tooltip within bounds (with 10px padding)
    left = Math.max(10, Math.min(left, containerRect.width - tooltipRect.width - 10));
    top = Math.max(10, Math.min(top, containerRect.height - tooltipRect.height - 10));

    // Apply position and fade in
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
  });
};
```

#### Hide Tooltip Function

```javascript
const hideTooltip = () => {
  if (!tooltip) return;
  tooltip.style.display = 'none';
  tooltip.style.opacity = '0';
};
```

#### Mouse Move Handler (Updated)

```javascript
const handleMouseMove = (event) => {
  const { x, y } = getMousePosition(event);
  const item = findItemAtPosition(x, y, layoutItems, getItemStyle);

  if (item !== currentHoveredItem) {
    currentHoveredItem = item;
    
    if (item) {
      overlay.style.cursor = 'pointer';
      showTooltip(item, event);          // ← Show tooltip on hover
      if (onItemHover) {
        onItemHover(item, event);
      }
    } else {
      overlay.style.cursor = 'default';
      hideTooltip();                     // ← Hide when not hovering
      if (onMouseLeave) {
        onMouseLeave();
      }
    }
  } else if (item) {
    // Update tooltip position on mouse move (smooth following)
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    if (tooltip && tooltip.style.display === 'block') {
      // Recalculate position
      // ... same logic as showTooltip
    }
  }
};
```

#### Mouse Leave Handler (Updated)

```javascript
const handleMouseLeave = () => {
  if (currentHoveredItem) {
    currentHoveredItem = null;
    overlay.style.cursor = 'default';
    hideTooltip();                       // ← Hide when leaving canvas
    
    if (onMouseLeave) {
      onMouseLeave();
    }
  }
};
```

---

## 🎨 CSS Styling (TimelineCanvas.css)

```css
/* Tooltip Container */
.timeline-canvas-tooltip {
  position: absolute;
  display: none;                        /* Hidden by default */
  opacity: 0;
  background: rgba(0, 0, 0, 0.85);     /* Semi-transparent black */
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  pointer-events: none;                /* Don't block mouse events */
  z-index: 100;                        /* Above everything */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);          /* Frosted glass effect */
  transition: opacity 0.2s ease-in-out;
  max-width: 280px;
  min-width: 200px;
}

/* Tooltip Content Layout */
.timeline-canvas-tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Tooltip Title */
.timeline-canvas-tooltip .tooltip-title {
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  word-wrap: break-word;               /* Handle long names */
}

/* Tooltip Details Section */
.timeline-canvas-tooltip .tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}

/* Each Info Row */
.timeline-canvas-tooltip .tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

/* Label (left side) */
.timeline-canvas-tooltip .tooltip-label {
  color: rgba(255, 255, 255, 0.7);    /* Dimmed */
  font-weight: 500;
  min-width: 60px;
}

/* Value (right side) */
.timeline-canvas-tooltip .tooltip-value {
  color: #ffffff;                      /* Bright */
  font-weight: 400;
  text-align: right;
  flex: 1;
}
```

---

## 🔄 Data Flow

```
User hovers over Canvas
    ↓
Overlay captures mousemove event
    ↓
canvasEventHandler.handleMouseMove(event)
    ↓
getMousePosition(event) → { x, y }
    ↓
findItemAtPosition(x, y) → item or null
    ↓
if (item) showTooltip(item, event)
    ↓
┌─────────────────────────────────────┐
│ 1. Get mouse position               │
│    mouseX, mouseY                   │
├─────────────────────────────────────┤
│ 2. Update tooltip content           │
│    - Title: item.name               │
│    - Status: item.status            │
│    - Dates: format(item.startDate)  │
│    - Progress: item.progress%       │
├─────────────────────────────────────┤
│ 3. Show tooltip (opacity: 0)        │
│    tooltip.style.display = 'block'  │
├─────────────────────────────────────┤
│ 4. Calculate position               │
│    - Default: right + below mouse   │
│    - Adjust if off-screen           │
│    - Keep within bounds             │
├─────────────────────────────────────┤
│ 5. Apply position & fade in         │
│    tooltip.style.left = '...'       │
│    tooltip.style.top = '...'        │
│    tooltip.style.opacity = '1'      │
└─────────────────────────────────────┘
```

---

## 📐 Positioning Logic

### Smart Positioning Algorithm

```javascript
// Step 1: Default position (right and below)
let left = mouseX + 15;  // 15px offset from cursor
let top = mouseY + 10;   // 10px offset from cursor

// Step 2: Check right boundary
if (left + tooltipWidth > containerWidth) {
  left = mouseX - tooltipWidth - 15;  // Flip to left
}

// Step 3: Check bottom boundary
if (top + tooltipHeight > containerHeight) {
  top = mouseY - tooltipHeight - 10;  // Flip to top
}

// Step 4: Keep within bounds (with padding)
left = Math.max(10, Math.min(left, containerWidth - tooltipWidth - 10));
top = Math.max(10, Math.min(top, containerHeight - tooltipHeight - 10));
```

### Visual Examples

```
┌─────────────────────────────────────────┐
│ Canvas Container                        │
│                                         │
│      🖱️ (mouse)                         │
│         ┌──────────────┐                │  ← Default: right + below
│         │ Tooltip      │                │
│         │ Status: ...  │                │
│         └──────────────┘                │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Canvas Container                        │
│                                         │
│                               🖱️ (mouse)│
│                  ┌──────────────┐       │  ← Flip to left
│                  │ Tooltip      │       │
│                  │ Status: ...  │       │
│                  └──────────────┘       │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Canvas Container                        │
│         ┌──────────────┐                │
│         │ Tooltip      │                │  ← Flip to top
│         │ Status: ...  │                │
│         └──────────────┘                │
│      🖱️ (mouse)                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Customization Examples

### 1. Change Tooltip Style

```css
/* Dark theme (current) */
.timeline-canvas-tooltip {
  background: rgba(0, 0, 0, 0.85);
  color: white;
}

/* Light theme */
.timeline-canvas-tooltip {
  background: rgba(255, 255, 255, 0.95);
  color: #262626;
  border: 1px solid #d9d9d9;
}

/* Colored border based on status */
.timeline-canvas-tooltip[data-status="Implementing"] {
  border-left: 4px solid #faad14;
}

.timeline-canvas-tooltip[data-status="Finalized"] {
  border-left: 4px solid #52c41a;
}
```

### 2. Add Custom Content

```javascript
// In canvasEventHandler.js - showTooltip()

detailsEl.innerHTML = `
  <div class="tooltip-row">
    <span class="tooltip-label">Status:</span> 
    <span class="tooltip-value">${item.status}</span>
  </div>
  <div class="tooltip-row">
    <span class="tooltip-label">Duration:</span> 
    <span class="tooltip-value">${duration} days</span>
  </div>
  <div class="tooltip-row">
    <span class="tooltip-label">Team:</span> 
    <span class="tooltip-value">${item.team || 'N/A'}</span>
  </div>
  <!-- Add progress bar -->
  <div class="tooltip-progress">
    <div class="tooltip-progress-bar" style="width: ${item.progress}%"></div>
  </div>
`;
```

### 3. Add Tooltip Arrow (Pointer)

```css
/* Add arrow pointing to item */
.timeline-canvas-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 20px;
  border: 6px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.85);
}

/* Adjust arrow position based on tooltip placement */
.timeline-canvas-tooltip.tooltip-top::before {
  bottom: auto;
  top: 100%;
  border-bottom-color: transparent;
  border-top-color: rgba(0, 0, 0, 0.85);
}
```

### 4. Add Delay Before Showing

```javascript
let tooltipTimeout = null;

const showTooltip = (item, event) => {
  // Clear existing timeout
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
  }
  
  // Show after 300ms delay
  tooltipTimeout = setTimeout(() => {
    // ... existing showTooltip code
  }, 300);
};

const hideTooltip = () => {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }
  // ... existing hideTooltip code
};
```

---

## 🐛 Debugging Tips

### 1. Check Tooltip Visibility

```javascript
// Add console logs in showTooltip
console.log('Tooltip:', {
  display: tooltip.style.display,
  opacity: tooltip.style.opacity,
  position: { left: tooltip.style.left, top: tooltip.style.top },
  content: titleEl.textContent
});
```

### 2. Visualize Tooltip Bounds

```javascript
// Add red border to see tooltip area
tooltip.style.border = '2px solid red';
```

### 3. Check Z-Index Layers

```javascript
// In browser DevTools console
document.querySelectorAll('.timeline-canvas-wrapper > *').forEach(el => {
  console.log(el.className, window.getComputedStyle(el).zIndex);
});

// Output:
// timeline-canvas auto
// timeline-canvas-overlay 5
// timeline-current-date 50
// timeline-canvas-tooltip 100
```

### 4. Test Positioning Logic

```javascript
// Force tooltip to specific position
tooltip.style.left = '100px';
tooltip.style.top = '100px';
tooltip.style.display = 'block';
tooltip.style.opacity = '1';
```

---

## ⚡ Performance Considerations

### 1. Avoid Frequent Updates

```javascript
// ❌ BAD: Update on every mousemove
handleMouseMove = (event) => {
  showTooltip(item, event); // Too many updates!
};

// ✅ GOOD: Update only when item changes
handleMouseMove = (event) => {
  const item = findItemAtPosition(x, y);
  if (item !== currentHoveredItem) {
    showTooltip(item, event); // Update once per item
  } else if (item) {
    updateTooltipPosition(event); // Just update position
  }
};
```

### 2. Use RequestAnimationFrame

```javascript
// Smooth position updates
const updateTooltipPosition = (event) => {
  requestAnimationFrame(() => {
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    // ... position calculation
  });
};
```

### 3. Debounce Tooltip Show

```javascript
import { debounce } from 'lodash';

const debouncedShowTooltip = debounce((item, event) => {
  showTooltip(item, event);
}, 150); // 150ms delay
```

---

## 📊 Comparison: DOM vs Canvas Tooltip

### DOM Tooltip (Current Implementation) ✅

**Pros:**
- ✅ Easy to style with CSS
- ✅ Support rich HTML content (images, icons, formatted text)
- ✅ Native browser rendering
- ✅ CSS animations/transitions
- ✅ Accessibility (screen readers can read)
- ✅ No canvas redraw needed

**Cons:**
- ❌ Adds DOM element overhead (minimal - just 1 element)
- ❌ Need z-index management

### Canvas Tooltip (Alternative) ❌

**Pros:**
- ✅ No DOM overhead
- ✅ Consistent with canvas rendering

**Cons:**
- ❌ Must redraw on every frame
- ❌ Complex text rendering
- ❌ No HTML support
- ❌ Difficult to style
- ❌ No accessibility
- ❌ Manual animation code

**Verdict:** DOM tooltip is **significantly better** for this use case.

---

## 🔧 Troubleshooting

### Issue 1: Tooltip not showing

**Check:**
```javascript
// 1. Ref is assigned
console.log('tooltipRef:', tooltipRef.current);

// 2. Tooltip is in DOM
console.log('Tooltip element:', document.querySelector('.timeline-canvas-tooltip'));

// 3. Event handler receives tooltip
// In canvasEventHandler.js
console.log('Tooltip param:', tooltip);
```

**Fix:**
```jsx
// Ensure tooltip ref is passed correctly
<div ref={tooltipRef} className="timeline-canvas-tooltip">
```

### Issue 2: Tooltip stuck on screen

**Check:**
```javascript
// hideTooltip is called on mouse leave
handleMouseLeave = () => {
  console.log('Hiding tooltip');
  hideTooltip();
};
```

**Fix:**
```javascript
// Ensure cleanup is called
overlay.addEventListener('mouseleave', handleMouseLeave);
```

### Issue 3: Tooltip position incorrect

**Check:**
```javascript
// Container rect is correct
const rect = container.getBoundingClientRect();
console.log('Container rect:', rect);

// Mouse position is relative to container
const mouseX = event.clientX - rect.left;
console.log('Mouse X:', mouseX);
```

**Fix:**
```javascript
// Use container, not overlay, for positioning
const rect = container.getBoundingClientRect(); // ✅
// Not: const rect = overlay.getBoundingClientRect(); // ❌
```

### Issue 4: Tooltip blocks clicks

**Check:**
```css
/* Tooltip should not capture pointer events */
.timeline-canvas-tooltip {
  pointer-events: none; /* ✅ Should be none */
}
```

---

## 📚 Summary

### Implementation Checklist

- [x] Add `tooltipRef` to TimelineCanvas
- [x] Create tooltip DOM structure
- [x] Pass tooltip to event handler
- [x] Implement `showTooltip()` function
- [x] Implement `hideTooltip()` function
- [x] Update `handleMouseMove()` to show/update tooltip
- [x] Update `handleMouseLeave()` to hide tooltip
- [x] Add CSS styles for tooltip
- [x] Implement smart positioning logic
- [x] Format tooltip content (dates, progress, etc.)

### Key Files Modified

1. **TimelineCanvas.jsx** - Added tooltip ref and DOM element
2. **canvasEventHandler.js** - Added tooltip show/hide logic
3. **TimelineCanvas.css** - Added tooltip styles

### Tooltip Features

✅ Shows on hover
✅ Hides on mouse leave
✅ Smart positioning (avoid off-screen)
✅ Smooth fade in/out
✅ Rich formatted content
✅ Dark theme with frosted glass effect
✅ Follows mouse cursor
✅ No performance impact

---

**Next Steps:**
- Want custom tooltip content? → Edit `showTooltip()` in canvasEventHandler.js
- Want different style? → Edit `.timeline-canvas-tooltip` in CSS
- Want delay before showing? → Add setTimeout in showTooltip
- Want tooltip arrow? → Add ::before pseudo-element in CSS

🎉 **Tooltip hoàn chỉnh và sẵn sàng sử dụng!**
