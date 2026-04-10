import React, { useState, useMemo } from 'react'

// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = {
  blue:   { bg: '#1890ff', light: '#e6f4ff', border: '#1890ff' },
  green:  { bg: '#52c41a', light: '#f6ffed', border: '#52c41a' },
  orange: { bg: '#fa8c16', light: '#fff7e6', border: '#fa8c16' },
  purple: { bg: '#722ed1', light: '#f9f0ff', border: '#722ed1' },
  red:    { bg: '#f5222d', light: '#fff1f0', border: '#f5222d' },
  cyan:   { bg: '#13c2c2', light: '#e6fffb', border: '#13c2c2' },
  gold:   { bg: '#faad14', light: '#fffbe6', border: '#faad14' },
  gray:   { bg: '#8c8c8c', light: '#fafafa', border: '#d9d9d9' },
}

const NODE_W = 160
const NODE_H = 64
const H_GAP  = 40   // khoảng cách ngang giữa các node cùng level
const V_GAP  = 100  // khoảng cách dọc giữa các level
const PAD    = 30   // padding canvas

// ─── 1. Node definitions — KHÔNG có x/y, layout tự động tính ─────────────────
const NODE_DEFS = [
  { id: 'bp',        label: 'Business Plan',      sub: 'Root entity',         color: 'blue'   },
  { id: 'revenue',   label: 'Revenue',            sub: 'All income streams',  color: 'green'  },
  { id: 'expense',   label: 'Expenses',           sub: 'Cost management',     color: 'orange' },
  { id: 'approval',  label: 'Approval Workflow',  sub: 'Multi-step review',   color: 'purple' },
  { id: 'prod_rev',  label: 'Production Revenue', sub: 'Software / IT',       color: 'cyan'   },
  { id: 'other_rev', label: 'Other Revenue',      sub: 'Non-core income',     color: 'cyan'   },
  { id: 'sell_exp',  label: 'Selling Expenses',   sub: 'Sales & marketing',   color: 'gold'   },
  { id: 'other_exp', label: 'Other Expenses',     sub: 'Admin & misc',        color: 'gold'   },
  { id: 'dept_mgr',  label: 'Dept. Manager',      sub: 'Level 1 approver',    color: 'red'    },
  { id: 'director',  label: 'Director / BOD',     sub: 'Level 2 approver',    color: 'red'    },
  { id: 'delivery',  label: 'Delivery Plan',      sub: 'Resource allocation', color: 'gray'   },
  { id: 'kpi',       label: 'KPI / Score',        sub: 'Performance metrics', color: 'gray'   },
  { id: 'currency',  label: 'Currency / FX',      sub: 'Exchange rate',       color: 'gray'   },
]

// ─── 2. Tree edges — định nghĩa quan hệ cha-con (dùng cho auto-layout) ────────
const TREE_EDGES = [
  { from: 'bp',       to: 'revenue',   label: 'has' },
  { from: 'bp',       to: 'expense',   label: 'has' },
  { from: 'bp',       to: 'approval',  label: 'goes through' },
  { from: 'revenue',  to: 'prod_rev',  label: '' },
  { from: 'revenue',  to: 'other_rev', label: '' },
  { from: 'expense',  to: 'sell_exp',  label: '' },
  { from: 'expense',  to: 'other_exp', label: '' },
  { from: 'approval', to: 'dept_mgr',  label: 'step 1' },
  { from: 'approval', to: 'director',  label: 'step 2' },
]

// ─── 3. Cross-cutting edges — nét đứt, không ảnh hưởng layout ─────────────────
const CROSS_EDGES = [
  { from: 'prod_rev',  to: 'delivery', label: 'feeds' },
  { from: 'prod_rev',  to: 'kpi',      label: 'scores' },
  { from: 'sell_exp',  to: 'kpi',      label: 'scored by' },
  { from: 'sell_exp',  to: 'currency', label: 'uses' },
  { from: 'other_rev', to: 'currency', label: 'uses' },
]

// ─── Auto-layout ──────────────────────────────────────────────────────────────
// Trả về { positions: { [id]: {x, y, level} }, canvasW, canvasH }
//
// Thuật toán:
//   Bước 1 — BFS từ root (node không có incoming edge) để gán level cho mỗi node
//   Bước 2 — Group nodes theo level, giữ thứ tự NODE_DEFS
//   Bước 3 — x = căn giữa hàng trong canvas;  y = padding + level × (nodeH + vGap)
function computeLayout(nodeDefs, treeEdges) {
  // Bước 1: đếm in-degree & build children list
  const children = {}
  const inDegree = {}
  nodeDefs.forEach(n => { children[n.id] = []; inDegree[n.id] = 0 })
  treeEdges.forEach(({ from, to }) => {
    children[from].push(to)
    inDegree[to] = (inDegree[to] || 0) + 1
  })

  // Bước 1b: BFS từ root nodes
  const level = {}
  const roots = nodeDefs.filter(n => inDegree[n.id] === 0).map(n => n.id)
  roots.forEach(id => (level[id] = 0))
  const queue = [...roots]
  while (queue.length) {
    const id = queue.shift()
    children[id].forEach(childId => {
      if (level[childId] === undefined) {
        level[childId] = level[id] + 1
        queue.push(childId)
      }
    })
  }

  // Bước 2: group by level, giữ thứ tự gốc của NODE_DEFS
  const nodeOrder = Object.fromEntries(nodeDefs.map((n, i) => [n.id, i]))
  const byLevel = {}
  Object.entries(level).forEach(([id, lv]) => {
    if (!byLevel[lv]) byLevel[lv] = []
    byLevel[lv].push(id)
  })
  Object.values(byLevel).forEach(ids => ids.sort((a, b) => nodeOrder[a] - nodeOrder[b]))

  // Bước 3: tính x/y
  const maxCount  = Math.max(...Object.values(byLevel).map(ids => ids.length))
  const canvasW   = PAD * 2 + maxCount * NODE_W + (maxCount - 1) * H_GAP
  const maxLevel  = Math.max(...Object.values(level))
  const canvasH   = PAD * 2 + (maxLevel + 1) * NODE_H + maxLevel * V_GAP

  const positions = {}
  Object.entries(byLevel).forEach(([lv, ids]) => {
    const lvNum  = parseInt(lv)
    const rowW   = ids.length * NODE_W + (ids.length - 1) * H_GAP
    const startX = (canvasW - rowW) / 2  // căn giữa từng hàng trong canvas
    ids.forEach((id, i) => {
      positions[id] = {
        x: startX + i * (NODE_W + H_GAP),
        y: PAD + lvNum * (NODE_H + V_GAP),
        level: lvNum,
      }
    })
  })

  return { positions, canvasW, canvasH }
}

// ─── Điểm nối trên border của node ───────────────────────────────────────────
// Thay vì nối từ center (đường chạy xuyên qua node), hàm này tìm điểm trên
// viền rectangle gần nhất theo hướng tới target.
//
// Cách tính: scale vector (dx, dy) sao cho chạm đúng cạnh ngang hoặc dọc.
//   scaleX = halfW / |dx|  →  nếu áp dụng thì chạm cạnh trái/phải
//   scaleY = halfH / |dy|  →  nếu áp dụng thì chạm cạnh trên/dưới
//   dùng min(scaleX, scaleY) để lấy cạnh gần hơn
function getBorderAnchor(pos, targetX, targetY) {
  const cx  = pos.x + NODE_W / 2
  const cy  = pos.y + NODE_H / 2
  const dx  = targetX - cx
  const dy  = targetY - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const scaleX = (NODE_W / 2) / Math.abs(dx || 0.001)
  const scaleY = (NODE_H / 2) / Math.abs(dy || 0.001)
  const scale  = Math.min(scaleX, scaleY)
  return { x: cx + dx * scale, y: cy + dy * scale }
}

// ─── Điểm giữa của cubic bezier tại t=0.5 ────────────────────────────────────
function bezierMid(p0, cp1, cp2, p1) {
  return {
    x: 0.125 * p0.x + 0.375 * cp1.x + 0.375 * cp2.x + 0.125 * p1.x,
    y: 0.125 * p0.y + 0.375 * cp1.y + 0.375 * cp2.y + 0.125 * p1.y,
  }
}

// ─── Node card ────────────────────────────────────────────────────────────────
function NodeCard({ node, pos, isHovered, onMouseEnter, onMouseLeave }) {
  const c = COLORS[node.color]
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={`Level ${pos.level}  |  x: ${Math.round(pos.x)}  y: ${Math.round(pos.y)}`}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: NODE_W,
        height: NODE_H,
        background: isHovered ? c.bg : c.light,
        border: `2px solid ${c.border}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        boxShadow: isHovered ? `0 4px 20px ${c.bg}88` : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        zIndex: 2,
      }}
    >
      <span style={{
        fontWeight: 700, fontSize: 12,
        color: isHovered ? '#fff' : c.border,
        textAlign: 'center', padding: '0 8px', lineHeight: 1.3,
      }}>
        {node.label}
      </span>
      <span style={{
        fontSize: 10,
        color: isHovered ? 'rgba(255,255,255,0.8)' : '#888',
        marginTop: 3, textAlign: 'center', padding: '0 6px',
      }}>
        Lv.{pos.level} — {node.sub}
      </span>
    </div>
  )
}

// ─── Edge (mũi tên) ───────────────────────────────────────────────────────────
// Control points tính dựa vào hướng từ-đến:
//   - Nếu dy lớn hơn (nối dọc): uốn cong theo chiều dọc (cp1 xuống, cp2 lên)
//   - Nếu dx lớn hơn (nối ngang): uốn cong ngang
function Edge({ edge, fromPos, toPos, fromColor, isActive, isDim, dashed }) {
  const c = COLORS[fromColor]

  const fromCenter = { x: fromPos.x + NODE_W / 2, y: fromPos.y + NODE_H / 2 }
  const toCenter   = { x: toPos.x   + NODE_W / 2, y: toPos.y   + NODE_H / 2 }

  // Điểm nối trên border của mỗi node, hướng về phía node kia
  const from = getBorderAnchor(fromPos, toCenter.x, toCenter.y)
  const to   = getBorderAnchor(toPos,   fromCenter.x, fromCenter.y)

  const dx   = to.x - from.x
  const dy   = to.y - from.y
  const bend = Math.abs(dy) > Math.abs(dx)
    ? Math.abs(dy) * 0.5   // nối dọc: control point uốn theo chiều y
    : Math.abs(dx) * 0.35  // nối ngang: control point uốn theo chiều x

  const cp1 = { x: from.x, y: from.y + (dy >= 0 ? bend : -bend) }
  const cp2 = { x: to.x,   y: to.y   - (dy >= 0 ? bend : -bend) }

  const pathD = `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`
  const mid   = bezierMid(from, cp1, cp2, to)

  const color    = isDim ? c.bg + '28' : c.bg
  const markerId = isDim ? `arrow-${fromColor}-dim` : `arrow-${fromColor}`

  return (
    <g>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeDasharray={dashed ? '6 4' : undefined}
        markerEnd={`url(#${markerId})`}
        style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
      />
      {edge.label && isActive && (
        <g transform={`translate(${mid.x},${mid.y})`}>
          <rect x={-32} y={-10} width={64} height={18} rx={4} fill={c.bg} opacity={0.93} />
          <text x={0} y={4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={600}>
            {edge.label}
          </text>
        </g>
      )}
    </g>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RelationshipOverviewPage() {
  const [hovered, setHovered] = useState(null)

  // computeLayout chạy 1 lần, không cần x/y trong data
  const { positions, canvasW, canvasH } = useMemo(
    () => computeLayout(NODE_DEFS, TREE_EDGES),
    []
  )

  const nodeMap = useMemo(
    () => Object.fromEntries(NODE_DEFS.map(n => [n.id, n])),
    []
  )

  const activeEdges = useMemo(() => {
    if (!hovered) return new Set()
    const s = new Set()
    ;[...TREE_EDGES, ...CROSS_EDGES].forEach(e => {
      if (e.from === hovered || e.to === hovered) s.add(`${e.from}_${e.to}`)
    })
    return s
  }, [hovered])

  const hasHover  = hovered !== null
  const allEdges  = [
    ...TREE_EDGES.map(e => ({ ...e, dashed: false })),
    ...CROSS_EDGES.map(e => ({ ...e, dashed: true })),
  ]

  return (
    <div style={{ padding: '24px 32px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1d2b4f' }}>
          Business Plan — Relationship Overview
        </h2>
        <p style={{ margin: '6px 0 0', color: '#666', fontSize: 13 }}>
          Layout <strong>tự động</strong>: BFS → gán level → chia đều x theo hàng.
          Hover để xem connections. Tooltip hiện tọa độ được tính.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries({
          blue: 'Core', green: 'Revenue', orange: 'Expense',
          purple: 'Workflow', cyan: 'Rev. type', gold: 'Exp. type',
          red: 'Approver', gray: 'Cross-cutting',
        }).map(([color, label]) => (
          <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[color].bg }} />
            <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
          <svg width={28} height={12}><line x1={0} y1={6} x2={28} y2={6} stroke="#aaa" strokeWidth={1.5} strokeDasharray="5 3" /></svg>
          <span style={{ fontSize: 12, color: '#555' }}>Cross-cutting</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        position: 'relative',
        width: canvasW,
        height: canvasH,
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e8ecf0',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* SVG layer */}
        <svg
          width={canvasW}
          height={canvasH}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
        >
          <defs>
            {Object.entries(COLORS).map(([key, c]) => (
              <React.Fragment key={key}>
                <marker id={`arrow-${key}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={c.bg} />
                </marker>
                <marker id={`arrow-${key}-dim`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={`${c.bg}40`} />
                </marker>
              </React.Fragment>
            ))}
          </defs>

          {allEdges.map(edge => {
            const fromPos = positions[edge.from]
            const toPos   = positions[edge.to]
            if (!fromPos || !toPos) return null
            const key      = `${edge.from}_${edge.to}`
            const isActive = activeEdges.has(key)
            const isDim    = hasHover && !isActive
            return (
              <Edge
                key={key}
                edge={edge}
                fromPos={fromPos}
                toPos={toPos}
                fromColor={nodeMap[edge.from].color}
                isActive={isActive}
                isDim={isDim}
                dashed={edge.dashed}
              />
            )
          })}
        </svg>

        {/* Node cards */}
        {NODE_DEFS.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            pos={positions[node.id]}
            isHovered={hovered === node.id}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>

      {/* Algorithm explanation */}
      <div style={{
        marginTop: 20, padding: '14px 20px',
        background: '#f0f5ff', borderRadius: 8,
        border: '1px solid #adc6ff', fontSize: 12, color: '#444', lineHeight: 1.8,
      }}>
        <strong style={{ color: '#2f54eb' }}>Cách tự động tính level, vị trí & điểm nối:</strong>
        <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
          <li>
            <strong>Level</strong>: BFS từ root (node không có incoming edge trong <code>TREE_EDGES</code>).
            Mỗi child nhận <code>level = level_cha + 1</code>.
          </li>
          <li>
            <strong>x</strong>: Group nodes cùng level, tính <code>rowWidth</code>,
            rồi <code>startX = (canvasW - rowWidth) / 2</code> → mỗi node dịch thêm <code>i × (NODE_W + H_GAP)</code>.
          </li>
          <li>
            <strong>y</strong>: <code>y = padding + level × (NODE_H + V_GAP)</code>
          </li>
          <li>
            <strong>Điểm nối (border anchor)</strong>: Từ center node, tính vector hướng về node kia,
            scale vector đó sao cho chạm đúng cạnh rectangle —
            <code> scale = min(halfW/|dx|, halfH/|dy|)</code>.
            Kết quả: mũi tên bắt đầu/kết thúc đúng tại viền node, không xuyên qua.
          </li>
          <li>
            <strong>Bezier</strong>: Control points uốn cong theo hướng chủ đạo
            (dọc nếu <code>|dy| &gt; |dx|</code>, ngang nếu ngược lại).
          </li>
        </ol>
      </div>
    </div>
  )
}
