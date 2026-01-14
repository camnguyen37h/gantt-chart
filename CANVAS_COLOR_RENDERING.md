# Canvas Color Rendering - Chi tiết cách vẽ màu cho Tasks

## 🎨 Luồng dữ liệu màu sắc từ Data → Canvas

### Bước 1: Data nguồn (mockData.js)

```javascript
// File: src/utils/mockData.js
export const ganttTasksData = [
  { 
    id: 12,
    name: 'Delivery 4', 
    start: '2024-06-01', 
    end: '2024-09-30', 
    resource: 'Implementing',  // ← Không có thuộc tính 'color' ở đây!
    progress: 90
  },
  // ... các tasks khác
];
```

**⚠️ Quan trọng:** Mock data **KHÔNG có** thuộc tính `color`. Màu sắc được **tự động sinh** dựa trên `resource` (status).

---

### Bước 2: Transform data thành Timeline Items (itemUtils.js)

```javascript
// File: src/lib/Timeline/utils/itemUtils.js

const STATUS_COLORS = {
  'Planning': '#1890ff',      // Xanh dương
  'Finalized': '#52c41a',     // Xanh lá
  'Released': '#722ed1',      // Tím
  'Implementing': '#faad14',  // Vàng cam
  'Delayed': '#f5222d'        // Đỏ
};

const DEFAULT_STATUS_COLOR = '#8c8c8c'; // Xám mặc định

export const transformToTimelineItems = (tasks) => {
  return tasks.map(task => {
    // Xác định màu dựa trên resource (status)
    const status = task.resource || 'Unknown';
    const color = STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
    
    return {
      id: task.id,
      name: task.name,
      startDate: task.start,
      endDate: task.end,
      status: status,
      progress: task.progress,
      color: color,  // ← MÀU ĐƯỢC GÁN Ở ĐÂY!
      type: task.type || 'range' // 'range' hoặc 'milestone'
    };
  });
};
```

**Kết quả sau transform:**
```javascript
{
  id: 12,
  name: 'Delivery 4',
  startDate: '2024-06-01',
  endDate: '2024-09-30',
  status: 'Implementing',
  progress: 90,
  color: '#faad14',  // ← ĐÃ CÓ MÀU!
  type: 'range'
}
```

---

### Bước 3: Tính toán Style cho mỗi Item (useTimeline.js)

```javascript
// File: src/lib/Timeline/hooks/useTimeline.js

const getItemStyle = useCallback((item) => {
  // ... tính toán vị trí (left, width, top, height)
  
  const left = daysFromStart * pixelsPerDay;
  const width = duration * pixelsPerDay;
  const top = item.row * rowHeight + itemPadding;
  
  return {
    left: `${left}px`,         // Vị trí X
    width: `${width}px`,       // Độ rộng
    top: `${top}px`,           // Vị trí Y
    height: `${itemHeight}px`, // Độ cao
    backgroundColor: item.color // ← MÀU TỪ ITEM!
  };
}, [timelineData, config, zoomLevel]);
```

**Kết quả style object:**
```javascript
{
  left: '1234px',
  width: '365px',
  top: '40px',
  height: '36px',
  backgroundColor: '#faad14' // ← VÀNG CAM (Implementing)
}
```

---

### Bước 4: Canvas Drawing - VẼ MÀU! (canvasRenderer.js)

#### 4.1. Lấy màu từ style

```javascript
// File: src/lib/Timeline/utils/canvasRenderer.js

const drawTimelineItems = (ctx, layoutItems, getItemStyle, hoveredItem) => {
  // Duyệt qua từng item
  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];
    
    // GỌI getItemStyle() để lấy style (bao gồm màu)
    const style = getItemStyle(item);
    //     ↓
    //   { backgroundColor: '#faad14', ... }
    
    const isHovered = hoveredItem && hoveredItem.id === item.id;
    
    if (isMilestone(item)) {
      drawMilestone(ctx, item, style, isHovered);
    } else {
      drawRangeItem(ctx, item, style, isHovered); // ← Vẽ thanh task
    }
  }
};
```

#### 4.2. Vẽ thanh màu lên Canvas

```javascript
const drawRangeItem = (ctx, item, style, isHovered) => {
  // Parse vị trí và kích thước từ style
  const left = parseFloat(style.left);     // 1234 (px)
  const top = parseFloat(style.top);       // 40 (px)
  const width = parseFloat(style.width);   // 365 (px)
  const height = parseFloat(style.height); // 36 (px)
  
  // ========================================
  // 🎨 PHẦN QUAN TRỌNG: GÁN MÀU CHO CANVAS!
  // ========================================
  
  ctx.save(); // Lưu trạng thái hiện tại
  
  // 1. Vẽ bóng đổ (shadow)
  if (isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
  }
  
  // 2. GÁN MÀU CHO CANVAS CONTEXT
  //    ↓↓↓ ĐÂY LÀ DÒNG CODE QUAN TRỌNG NHẤT! ↓↓↓
  ctx.fillStyle = style.backgroundColor || item.color || '#1890ff';
  //              ^^^^^^^^^^^^^^^^^^^^^^^^
  //              Màu từ style (đã tính ở bước 3)
  //                                      ^^^^^^^^^^^^
  //                                      Hoặc màu từ item (bước 2)
  //                                                     ^^^^^^^^^^
  //                                                     Hoặc màu mặc định (xanh dương)
  
  // VD: ctx.fillStyle = '#faad14'; // Vàng cam
  
  // 3. Vẽ hình chữ nhật bo góc (rounded rectangle)
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 4);
  //            ^^^^  ^^^  ^^^^^  ^^^^^^  ^
  //            X     Y    Width  Height  BorderRadius
  //            1234  40   365    36      4px
  
  // 4. Tô màu (fill) - Canvas sẽ tô màu '#faad14' vào hình chữ nhật
  ctx.fill(); // ← Vẽ thanh màu lên canvas tại đây!
  
  // 5. Reset shadow để không ảnh hưởng đến text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // 6. Vẽ text trắng lên thanh màu
  ctx.fillStyle = 'white'; // Đổi màu fill thành trắng cho text
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.textBaseline = 'middle';
  
  const textX = left + 12;           // Padding 12px từ trái
  const textY = top + height / 2;    // Giữa theo chiều dọc
  const maxTextWidth = width - 24;   // Trừ padding 2 bên
  
  if (maxTextWidth > 30) {
    const text = item.name || '';
    const metrics = ctx.measureText(text);
    
    // Truncate text nếu quá dài
    if (metrics.width > maxTextWidth) {
      let truncated = text;
      while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      ctx.fillText(truncated + '...', textX, textY);
    } else {
      ctx.fillText(text, textX, textY);
    }
    
    // Vẽ % progress
    if (item.progress !== undefined) {
      const progressText = `${item.progress}%`;
      const progressMetrics = ctx.measureText(progressText);
      const progressX = left + width - progressMetrics.width - 12;
      
      if (progressX > textX + metrics.width + 10) {
        ctx.fillText(progressText, progressX, textY);
      }
    }
  }
  
  // 7. Vẽ progress bar overlay (màu trắng trong suốt)
  if (item.progress !== undefined) {
    const progressWidth = (width * item.progress) / 100;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; // Trắng 25% opacity
    ctx.beginPath();
    ctx.roundRect(left, top, progressWidth, height, 4);
    ctx.fill();
  }
  
  ctx.restore(); // Khôi phục trạng thái
};
```

---

## 🔬 Phân tích Canvas API chi tiết

### ctx.fillStyle - Thuộc tính màu

```javascript
// fillStyle chấp nhận nhiều định dạng màu:

// 1. Hex color (phổ biến nhất)
ctx.fillStyle = '#faad14';  // Vàng cam
ctx.fillStyle = '#1890ff';  // Xanh dương

// 2. RGB/RGBA
ctx.fillStyle = 'rgb(250, 173, 20)';      // RGB
ctx.fillStyle = 'rgba(24, 144, 255, 0.8)'; // RGBA (có opacity)

// 3. Named colors
ctx.fillStyle = 'red';
ctx.fillStyle = 'blue';

// 4. Gradients (chưa dùng)
const gradient = ctx.createLinearGradient(0, 0, 200, 0);
gradient.addColorStop(0, '#faad14');
gradient.addColorStop(1, '#f5222d');
ctx.fillStyle = gradient;

// 5. Patterns (chưa dùng)
const pattern = ctx.createPattern(image, 'repeat');
ctx.fillStyle = pattern;
```

### ctx.roundRect() - Vẽ hình chữ nhật bo góc

```javascript
ctx.roundRect(x, y, width, height, radius);
//            ↓  ↓  ↓      ↓       ↓
//            │  │  │      │       └─ Border radius (4px)
//            │  │  │      └───────── Chiều cao (36px)
//            │  │  └──────────────── Chiều rộng (365px)
//            │  └─────────────────── Tọa độ Y (40px)
//            └────────────────────── Tọa độ X (1234px)

// Tương đương CSS:
// div {
//   position: absolute;
//   left: 1234px;
//   top: 40px;
//   width: 365px;
//   height: 36px;
//   border-radius: 4px;
// }
```

### ctx.fill() - Tô màu

```javascript
// Quy trình vẽ:
ctx.beginPath();           // Bắt đầu path mới
ctx.roundRect(x, y, w, h); // Định nghĩa hình dạng
ctx.fill();                // Tô màu bằng fillStyle hiện tại
ctx.stroke();              // Hoặc vẽ viền (nếu muốn)
```

---

## 📊 Visual Breakdown - Từng pixel trên Canvas

```
Canvas (width: 3000px, height: 400px)
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Grid lines (màu xám: rgba(0,0,0,0.06))                │
│  │     │     │     │     │     │     │     │           │
│  │     │     │     │     │     │     │     │           │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ ← Row 0  │
│  │     │     │     │     │     │     │     │           │
│  │     │  ┌──────────────────────┐  │     │           │
│  │     │  │ #1890ff (Planning)   │  │     │           │ ← ctx.fillStyle = '#1890ff'
│  │     │  │ "Initial Planning"   │  │     │           │   ctx.fill()
│  │     │  └──────────────────────┘  │     │           │
│  │     │     │     │     │     │     │     │           │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ ← Row 1  │
│  │     │     │     │     │     │     │     │           │
│  │     │     │  ┌────────────────────────┐ │           │
│  │     │     │  │ #52c41a (Finalized)    │ │           │ ← ctx.fillStyle = '#52c41a'
│  │     │     │  │ "Requirement phase 1"  │ │           │   ctx.fill()
│  │     │     │  └────────────────────────┘ │           │
│  │     │     │     │     │     │     │     │           │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ ← Row 2  │
│  │     │     │     │  ┌─────────────┐ │     │           │
│  │     │     │     │  │ #faad14     │ │     │           │ ← ctx.fillStyle = '#faad14'
│  │     │     │     │  │ "Delivery 4"│ │     │           │   ctx.fill()
│  │     │     │     │  │ 90%         │ │     │           │
│  │     │     │     │  └─────────────┘ │     │           │
│  │     │     │     │     │     │     │     │           │
└─────────────────────────────────────────────────────────┘
  ↑                    ↑
  left: 0px            left: 1234px
```

---

## 🎯 So sánh DOM vs Canvas - Cách vẽ màu

### DOM Rendering (TimelineGrid.jsx)

```jsx
// DOM: Tạo element với style
<div 
  className="timeline-item-range"
  style={{
    left: '1234px',
    top: '40px',
    width: '365px',
    height: '36px',
    backgroundColor: '#faad14',  // ← Gán màu qua CSS
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
  }}
>
  <span className="timeline-item-text">Delivery 4</span>
  <span className="timeline-item-progress">90%</span>
</div>
```

**Browser sẽ:**
1. Tạo DOM node
2. Parse CSS
3. Layout (position)
4. Paint (vẽ màu backgroundColor)
5. Composite

---

### Canvas Rendering (canvasRenderer.js)

```javascript
// Canvas: Vẽ trực tiếp lên pixel buffer
ctx.fillStyle = '#faad14';      // ← Gán màu qua Canvas API
ctx.shadowColor = 'rgba(0,0,0,0.12)';
ctx.shadowBlur = 3;
ctx.beginPath();
ctx.roundRect(1234, 40, 365, 36, 4);
ctx.fill();                     // ← Tô màu ngay lập tức
ctx.fillStyle = 'white';
ctx.fillText('Delivery 4', 1246, 58);
ctx.fillText('90%', 1587, 58);
```

**Browser sẽ:**
1. Execute JavaScript code
2. Vẽ trực tiếp lên canvas bitmap
3. Không có layout/reflow
4. Không có DOM nodes

---

## 🧪 Demo Code - Test màu sắc

### Thử nghiệm với màu tùy chỉnh:

```javascript
// File: src/utils/mockData.js

export const ganttTasksData = [
  { 
    id: 1,
    name: 'Custom Color Task',
    start: '2024-01-01',
    end: '2024-03-01',
    resource: 'Planning',
    progress: 50,
    color: '#ff1493'  // ← Custom màu hồng đậm (DeepPink)
  }
];

// Transform sẽ ưu tiên custom color:
const transformedItem = {
  color: task.color || STATUS_COLORS[task.resource] || DEFAULT_STATUS_COLOR
  //     ^^^^^^^^^^
  //     Nếu có custom color thì dùng, không thì dùng status color
};

// Canvas sẽ vẽ:
ctx.fillStyle = style.backgroundColor || item.color || '#1890ff';
//              ^^^^^^^^^^^^^^^^^^^^^^^^
//              Custom color được ưu tiên
```

### Test với Gradient (nâng cao):

```javascript
// canvasRenderer.js - Custom gradient cho special tasks

const drawRangeItem = (ctx, item, style, isHovered) => {
  // ... existing code ...
  
  // Special gradient cho tasks có progress > 90%
  if (item.progress > 90) {
    const gradient = ctx.createLinearGradient(left, top, left + width, top);
    gradient.addColorStop(0, style.backgroundColor);
    gradient.addColorStop(1, '#52c41a'); // Green
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = style.backgroundColor || item.color || '#1890ff';
  }
  
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 4);
  ctx.fill();
};
```

---

## 🔍 Debug màu sắc

### 1. Console log màu đang vẽ:

```javascript
const drawRangeItem = (ctx, item, style, isHovered) => {
  const color = style.backgroundColor || item.color || '#1890ff';
  
  console.log('🎨 Drawing:', {
    itemName: item.name,
    status: item.status,
    color: color,
    position: { left, top, width, height }
  });
  
  ctx.fillStyle = color;
  ctx.fill();
};

// Console output:
// 🎨 Drawing: {
//   itemName: "Delivery 4",
//   status: "Implementing",
//   color: "#faad14",
//   position: { left: 1234, top: 40, width: 365, height: 36 }
// }
```

### 2. Visualize màu trong DevTools:

```javascript
// Thêm data attribute để debug
const drawRangeItem = (ctx, item, style, isHovered) => {
  // ... vẽ canvas ...
  
  // Log ra HTML element tương đương (để so sánh)
  console.log(`
    <div style="
      background: ${style.backgroundColor};
      left: ${left}px;
      top: ${top}px;
      width: ${width}px;
      height: ${height}px;
    ">${item.name}</div>
  `);
};
```

### 3. Test màu với Canvas Inspector:

```javascript
// Sau khi vẽ, kiểm tra pixel color
const imageData = ctx.getImageData(left + 10, top + 10, 1, 1);
const pixel = imageData.data; // [R, G, B, A]

console.log('Pixel color:', {
  red: pixel[0],
  green: pixel[1],
  blue: pixel[2],
  alpha: pixel[3],
  hex: rgbToHex(pixel[0], pixel[1], pixel[2])
});

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Output: Pixel color: { red: 250, green: 173, blue: 20, alpha: 255, hex: "#faad14" }
```

---

## 💡 Performance Tips - Màu sắc

### 1. Cache fillStyle nếu vẽ nhiều items cùng màu:

```javascript
const drawTimelineItems = (ctx, layoutItems, getItemStyle, hoveredItem) => {
  // Group items by color
  const itemsByColor = {};
  
  for (let item of layoutItems) {
    const style = getItemStyle(item);
    const color = style.backgroundColor || item.color || '#1890ff';
    
    if (!itemsByColor[color]) {
      itemsByColor[color] = [];
    }
    itemsByColor[color].push({ item, style });
  }
  
  // Draw items grouped by color (reduce fillStyle changes)
  for (let color in itemsByColor) {
    ctx.fillStyle = color; // Set once
    
    for (let { item, style } of itemsByColor[color]) {
      ctx.beginPath();
      ctx.roundRect(parseFloat(style.left), parseFloat(style.top), 
                    parseFloat(style.width), parseFloat(style.height), 4);
      ctx.fill(); // Use same color
    }
  }
};
```

### 2. Pre-calculate colors:

```javascript
// Thay vì tính màu mỗi lần vẽ:
const color = STATUS_COLORS[item.status] || DEFAULT_COLOR; // Slow

// Cache colors khi transform data:
const transformedItem = {
  ...item,
  _cachedColor: STATUS_COLORS[item.status] || DEFAULT_COLOR
};

// Canvas drawing:
ctx.fillStyle = item._cachedColor; // Fast!
```

---

## 📚 Tổng kết

### Luồng màu sắc hoàn chỉnh:

```
Mock Data (không có color)
    ↓
itemUtils.transformToTimelineItems()
    ↓ Gán màu dựa trên STATUS_COLORS
    ↓
Timeline Item { color: '#faad14' }
    ↓
useTimeline.getItemStyle()
    ↓ Copy màu vào style object
    ↓
Style Object { backgroundColor: '#faad14' }
    ↓
canvasRenderer.drawTimelineItems()
    ↓ Lấy màu từ style
    ↓
ctx.fillStyle = '#faad14'
    ↓
ctx.fill()
    ↓
Pixel màu vàng cam hiển thị trên Canvas! 🎨
```

### Canvas API chính cho màu sắc:

| API | Mục đích | Ví dụ |
|-----|----------|-------|
| `ctx.fillStyle` | Gán màu fill (tô) | `ctx.fillStyle = '#faad14'` |
| `ctx.strokeStyle` | Gán màu viền | `ctx.strokeStyle = 'red'` |
| `ctx.shadowColor` | Gán màu bóng đổ | `ctx.shadowColor = 'rgba(0,0,0,0.12)'` |
| `ctx.fill()` | Tô màu shape | `ctx.fill()` |
| `ctx.stroke()` | Vẽ viền | `ctx.stroke()` |

### Màu sắc mặc định:

```javascript
const STATUS_COLORS = {
  'Planning': '#1890ff',      // 🔵 Xanh dương
  'Finalized': '#52c41a',     // 🟢 Xanh lá
  'Released': '#722ed1',      // 🟣 Tím
  'Implementing': '#faad14',  // 🟠 Vàng cam
  'Delayed': '#f5222d'        // 🔴 Đỏ
};
```

---

**Next Steps:**
- Muốn thêm màu mới? → Sửa `STATUS_COLORS` trong `itemUtils.js`
- Muốn custom color cho task? → Thêm `color` property vào mock data
- Muốn gradient? → Dùng `ctx.createLinearGradient()`
- Muốn pattern? → Dùng `ctx.createPattern()`

**File quan trọng:**
- `src/lib/Timeline/utils/canvasRenderer.js:122` - Dòng code gán màu chính
- `src/lib/Timeline/utils/itemUtils.js` - Định nghĩa STATUS_COLORS
- `src/lib/Timeline/hooks/useTimeline.js:143` - Copy màu vào style

🎨 **Happy Canvas Painting!**
