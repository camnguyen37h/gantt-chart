# Thuật toán vẽ Relationship Diagram — `RelationshipOverviewPage.jsx`

> File tham chiếu: `src/pages/RelationshipOverviewPage.jsx`

---

## Tổng quan pipeline

```
NODE_DEFS + TREE_EDGES
        │
        ▼
┌─────────────────────┐
│  1. computeLayout() │  ← Tính level, x, y cho mỗi node
└─────────────────────┘
        │  positions: { [id]: { x, y, level } }
        ▼
┌─────────────────────┐
│  2. getBorderAnchor │  ← Tìm điểm nối trên viền node (không xuyên tâm)
└─────────────────────┘
        │  anchor: { x, y }
        ▼
┌─────────────────────┐
│  3. Cubic Bezier    │  ← Vẽ đường cong qua 2 anchor + 2 control points
└─────────────────────┘
        │  SVG <path d="M ... C ...">
        ▼
┌─────────────────────┐
│  4. SVG <marker>    │  ← Gắn đầu mũi tên vào cuối path
└─────────────────────┘
```

---

## Bước 1 — `computeLayout()`: Tính level và vị trí

### 1a. Tính in-degree để tìm root

```
in-degree[node] = số lượng TREE_EDGES có to === node
```

Node nào có `in-degree = 0` → **root** (không có ai trỏ vào nó).  
Trong ví dụ này: `bp` là root duy nhất.

```
inDegree = {
  bp: 0,        ← root
  revenue: 1,   ← bp trỏ vào
  expense: 1,
  approval: 1,
  prod_rev: 1,  ← revenue trỏ vào
  ...
}
```

### 1b. BFS (Breadth-First Search) → gán level

```
Khởi tạo:  level[root] = 0,  queue = [root]

Lặp:
  id = queue.shift()
  for each child of id:
    if child chưa có level:
      level[child] = level[id] + 1
      queue.push(child)
```

Kết quả với dữ liệu hiện tại:

| Node | Level |
|------|-------|
| `bp` | 0 |
| `revenue`, `expense`, `approval` | 1 |
| `prod_rev`, `other_rev`, `sell_exp`, `other_exp`, `dept_mgr`, `director` | 2 |
| `delivery`, `kpi`, `currency` | 3 |

> **Tại sao BFS?** BFS duyệt theo từng tầng, đảm bảo node nhận level nhỏ nhất
> (đường đi ngắn nhất từ root). DFS có thể gán level sai nếu graph có nhiều đường đến cùng một node.

### 1c. Tính kích thước canvas

```
maxCount = max số node trong 1 hàng      (ví dụ: level 2 có 6 node)
canvasW  = PAD×2 + maxCount×NODE_W + (maxCount-1)×H_GAP

maxLevel = level lớn nhất                (ví dụ: 3)
canvasH  = PAD×2 + (maxLevel+1)×NODE_H + maxLevel×V_GAP
```

Canvas tự co giãn theo dữ liệu, không hardcode.

### 1d. Tính x, y từng node

```
// y — chỉ phụ thuộc level:
y = PAD + level × (NODE_H + V_GAP)

// x — căn giữa hàng:
rowWidth = count × NODE_W + (count-1) × H_GAP
startX   = (canvasW - rowWidth) / 2      ← lề trái của hàng
x[i]     = startX + i × (NODE_W + H_GAP) ← node thứ i trong hàng
```

Ví dụ level 1 có 3 node, canvas rộng 1060px:
```
rowWidth = 3×160 + 2×40 = 560
startX   = (1060 - 560) / 2 = 250
x[0] = 250  (revenue)
x[1] = 450  (expense)
x[2] = 650  (approval)
```

---

## Bước 2 — `getBorderAnchor()`: Điểm nối trên viền node

**Vấn đề:** Nếu nối center ↔ center, đường chạy xuyên qua hộp node — trông xấu.  
**Giải pháp:** Tìm điểm trên border rectangle của node, nằm trên đường thẳng center → target.

```
center = { cx = pos.x + NODE_W/2,  cy = pos.y + NODE_H/2 }
vector = { dx = targetX - cx,       dy = targetY - cy }

// Scale nhỏ nhất để vector chạm cạnh nào trước:
scaleX = (NODE_W/2) / |dx|   → chạm cạnh trái hoặc phải
scaleY = (NODE_H/2) / |dy|   → chạm cạnh trên hoặc dưới
scale  = min(scaleX, scaleY)  → cạnh gần hơn thắng

anchor = { x: cx + dx×scale,  y: cy + dy×scale }
```

**Minh họa:**

```
        target ở phía dưới-phải:
        dx = 100,  dy = 200
        scaleX = 80/100 = 0.8   → chạm cạnh phải tại y = cy + 160
        scaleY = 32/200 = 0.16  → chạm cạnh dưới tại x = cx + 16
        scale  = min(0.8, 0.16) = 0.16
        anchor = đáy node (cạnh dưới thắng vì dy lớn hơn)
```

---

## Bước 3 — Cubic Bezier: Vẽ đường cong

### SVG Path syntax

```
M x0 y0  C cx1 cy1, cx2 cy2, x1 y1
│          │              │
start      control pts    end
```

- `M` = MoveTo điểm đầu
- `C` = CurveTo (cubic bezier) với 2 control points

### Tính control points

```javascript
dx = to.x - from.x
dy = to.y - from.y

// Độ cong (bend) phụ thuộc hướng chính:
if |dy| > |dx|:          // nối chủ yếu theo chiều dọc
  bend = |dy| × 0.5
else:                     // nối chủ yếu theo chiều ngang
  bend = |dx| × 0.35

cp1 = { x: from.x,  y: from.y + (dy≥0 ? +bend : -bend) }
cp2 = { x: to.x,    y: to.y   - (dy≥0 ? +bend : -bend) }
```

**Logic:** cp1 "kéo xuống" từ điểm đầu, cp2 "kéo lên" vào điểm cuối → đường cong hình chữ S mềm mại, tránh đường thẳng cứng.

### Vì sao không dùng `buildPath()` (center-to-center)?

Hàm `buildPath` cũ:
```
cp1 = { x: from.x, y: midY }
cp2 = { x: to.x,   y: midY }
```
Control points thẳng đứng → cong đẹp khi 2 node thẳng hàng dọc, nhưng méo khi nối chéo. Cách mới dùng `bend` thích nghi theo hướng thực tế.

---

## Bước 4 — SVG `<marker>`: Đầu mũi tên

```xml
<defs>
  <marker id="arrow-blue" markerWidth="8" markerHeight="8"
          refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 z" fill="#1890ff" />
  </marker>
</defs>

<path ... markerEnd="url(#arrow-blue)" />
```

- `orient="auto"` → mũi tên tự xoay theo hướng của path
- `refX="6"` → dịch marker về phía sau để đầu nhọn đặt đúng tại điểm cuối path
- Mỗi màu có 2 marker: bình thường và `-dim` (mờ 16% opacity khi hover node khác)

---

## Bước 5 — `bezierMid()`: Vị trí label trên đường

Khi hover node, label hiện ra tại điểm giữa của bezier (t = 0.5):

```
// De Casteljau formula tại t = 0.5:
mid.x = 0.125×p0.x + 0.375×cp1.x + 0.375×cp2.x + 0.125×p1.x
mid.y = 0.125×p0.y + 0.375×cp1.y + 0.375×cp2.y + 0.125×p1.y
```

Công thức mở rộng từ `B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3` tại t=0.5:

$$B(0.5) = \frac{1}{8}P_0 + \frac{3}{8}P_1 + \frac{3}{8}P_2 + \frac{1}{8}P_3$$

---

## Bước 6 — Hover highlight

```javascript
// Khi hover node X, tính set các edge liên quan:
activeEdges = new Set(
  allEdges
    .filter(e => e.from === X || e.to === X)
    .map(e => `${e.from}_${e.to}`)
)

// Với mỗi edge khi render:
isActive = activeEdges.has(edgeKey)
isDim    = hasHover && !isActive

stroke        = isDim ? color + '28' : color   // opacity hex 16%
strokeWidth   = isActive ? 2.5 : 1.5
markerEnd     = isDim ? arrow-dim : arrow
showLabel     = isActive && edge.label != ''
```

---

## Tham số điều chỉnh layout

| Hằng số | Giá trị | Ý nghĩa |
|---------|---------|---------|
| `NODE_W` | 160 | Chiều rộng node (px) |
| `NODE_H` | 64  | Chiều cao node (px) |
| `H_GAP`  | 40  | Khoảng cách ngang giữa 2 node cùng hàng |
| `V_GAP`  | 100 | Khoảng cách dọc giữa 2 level |
| `PAD`    | 30  | Padding xung quanh canvas |

---

## Cách thêm node/edge mới

Chỉ cần thêm vào data, layout tự tính lại:

```javascript
// Thêm node:
NODE_DEFS.push({ id: 'new_node', label: 'New Node', sub: '...', color: 'blue' })

// Thêm edge cây (ảnh hưởng layout):
TREE_EDGES.push({ from: 'bp', to: 'new_node', label: 'has' })

// Thêm edge chéo (nét đứt, không ảnh hưởng layout):
CROSS_EDGES.push({ from: 'new_node', to: 'kpi', label: 'tracks' })
```

Không cần chỉnh x, y thủ công.
