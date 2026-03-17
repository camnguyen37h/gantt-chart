# Workflow Approval — Tổng hợp logic

## 1. Luồng dữ liệu tổng quan

```
mockApprovalSteps (mock data)
    ↓
getBusinessPlanWorkflow (API call)
    ↓
fetchBusinessPlanWorkflow (async thunk)
    ↓  trả về payload = { data: { [stepId]: step }, workOrder: { G1, G3, GKR } }
businessApproval reducer
    ↓  tính toán listStep + listWorkOrder
useBusinessPlanStep hook
    ↓  expose listStep, listWorkOrder
BusinessPlanStep/index.jsx
    ↓  truyền props
WorkflowApproval.jsx  →  ApprovalList.jsx
```

---

## 2. Cấu trúc mock data (`mockApprovalSteps`)

```
{
  httpStatus: 200,
  data: {
    data: {
      "draft":     { stepName, stateName: "Draft",        stateOrder: 10,    order: 1, map: { None: [] } },
      "budu_lead": { stepName, stateName: "Verification", stateOrder: 100,   order: 1, map: { G1:[...], G3:[...], GKR:[...] } },
      "g_lead":    { stepName, stateName: "Verification", stateOrder: 100,   order: 2, map: { G1:[...], G3:[...], GKR:[...] } },
      "fc":        { stepName, stateName: "Peer Review",  stateOrder: 1000,  order: 1, map: { None:[...] } },
      "bom":       { stepName, stateName: "Peer Review",  stateOrder: 1000,  order: 2, map: { None:[...] } },
      "ceo":       { stepName, stateName: "Peer Review",  stateOrder: 1000,  order: 3, map: { None:[...] } },
      "approved":  { stepName, stateName: "Approved",     stateOrder: 10000, order: 1, map: { None: [] } }
    },
    workOrder: {
      G1:  [{ duName: "DU1.12" }],
      G3:  [{ duName: "DU3.1" }, { duName: "BU3" }],
      GKR: [{ duName: "BKR1" }]
    }
  }
}
```

### Các loại `map` key:
| Key | Ý nghĩa |
|-----|---------|
| `G1`, `G3`, `GKR` + `departmentName !== gKey` | Bước **DU/BU Lead** — approver thuộc DU con |
| `G1`, `G3`, `GKR` + `departmentName === gKey` | Bước **G Lead** — approver thuộc group |
| `None` | Bước **FC / BOM / CEO** — không phân theo group |

### Cấu trúc mỗi approver trong map:
```js
{
  id: 5310,
  taskKey: "BP-5310",
  approvalStepId: 8579,
  ldap: "nvthang9",
  departmentName: "DU1.12",   // tên DU/Group của approver
  processStatus: "APPROVED",   // "APPROVED" | "TODO" | "REJECTED"
  history: [...]
}
```

---

## 3. Reducer — `businessApproval.js`

**Bước 1: Lọc và sắp xếp**
```js
// Loại bỏ Draft & Approved (chỉ là node đầu/cuối, không render)
const filteredSteps = ogSteps.filter(
  item => !item.stateName.match(/Draft|Approved/)
)
// Sắp xếp theo stateOrder rồi order
filteredSteps.sort((a, b) =>
  a.stateOrder !== b.stateOrder ? a.stateOrder - b.stateOrder : a.order - b.order
)
```

**Bước 2: Xác định bước hiện tại**
```js
const indexSelected = filteredSteps.findLastIndex(item =>
  Object.values(item.map).some(data => data.length > 0)
)
```
→ Backend chỉ populate `map` cho những bước **đã đến lượt**. Bước chưa đến → `map` rỗng.

**Bước 3: Đánh dấu bước chưa đến là `wait`**
```js
const mappedSteps = filteredSteps.map((item, index) => {
  if (index > indexSelected) return { ...item, status: 'wait' }
  return item
})
```

**Bước 4: Tính `length` spacer cho `listWorkOrder`**
```js
// Tìm bước DU-level (approver thuộc DU con, không phải G)
const duStep = mappedSteps.find(step =>
  Object.keys(step.map).some(
    gKey => gKey !== 'None' && step.map[gKey][0].departmentName !== gKey
  )
)

// length = số approver trong cùng DU - 1 (dùng để tạo spacer căn thẳng hàng)
listWorkOrderRes[gKey] = listWorkOrderRes[gKey].map(wo => ({
  ...wo,
  length: duStep
    ? duStep.map[gKey].filter(item => item.departmentName === wo.duName).length - 1
    : 0
}))
```

---

## 4. Xác định icon tại mỗi step — `useWorkflowApproval.js`

```js
const renderStatus = approvalStatuses => {
  // approvalStatuses = mảng processStatus của tất cả approver trong step

  if (any === "REJECTED") → { status: 'error',   icon: ❌ }
  if (any === "TODO")     → { status: 'process',  icon: ⏳ }  ← bước đang chờ
  if (all === "APPROVED") → { status: 'finish',   icon: ✅ }  ← bước xong
  // nếu map rỗng + status: 'wait' từ reducer → icon ⬜ xám
}
```

---

## 5. Render UI — `ApprovalList.jsx`

Ba loại render khác nhau tùy `map` key:

### Case 1: `map` có key `None` (FC, BOM, CEO)
- Render tất cả approver thành 1 cột duy nhất
- Thêm spacer phía dưới để chiều cao bằng tổng `allWOLength` (căn thẳng với cột DU bên trái)

### Case 2: `map` có key G1/G3/GKR + `isDU = true` (BU/DU Lead)
- `isDU = departmentName !== gKey` → approver thuộc DU con
- Với mỗi `gKey`, với mỗi `wo` trong `listDU[gKey]`: render approver có `departmentName === wo.duName`

### Case 3: `map` có key G1/G3/GKR + `isDU = false` (G Lead)
- Approver thuộc level Group
- Dùng `gWO.length` (KHÔNG phải `gWOLength = gWO.length + sum(wo.length)`) để tính spacer
- **Lý do:** `wo.length` chỉ có ý nghĩa ở bước DU-level, không áp dụng cho G-level

---

## 6. Ví dụ trạng thái workflow

### Tất cả đã approved (mock hiện tại):
```
BU/DU Lead  → tất cả processStatus: "APPROVED"  → ✅
G Lead      → tất cả processStatus: "APPROVED"  → ✅
FC          → processStatus: "APPROVED"          → ✅
BOM         → processStatus: "APPROVED"          → ✅
CEO         → processStatus: "APPROVED"          → ✅
```

### FC đang chờ approve (ví dụ thực tế):
```
BU/DU Lead  → tất cả "APPROVED"  → ✅
G Lead      → tất cả "APPROVED"  → ✅
FC          → ttmy: "TODO"        → ⏳  ← indexSelected dừng ở đây
BOM         → map: {} rỗng       → ⬜ (wait)
CEO         → map: {} rỗng       → ⬜ (wait)
```

### Để demo trạng thái FC đang chờ, thay trong `mockApprovalSteps`:
```js
"fc": {
  map: { None: [{ ..., processStatus: "TODO" }] }   // ← đổi thành TODO
},
"bom": { map: { None: [] } },   // ← xóa approver
"ceo": { map: { None: [] } },   // ← xóa approver
```

---

## 7. Files liên quan

| File | Vai trò |
|------|---------|
| `src/utils/mockBusinessPlanData.js` | Mock data — `mockApprovalSteps` |
| `src/lib/business-plan/redux/reducers/businessApproval.js` | Xử lý data → `listStep`, `listWorkOrder` |
| `src/lib/business-plan/redux/asyncThunks/businessApproval.js` | Async thunk gọi API |
| `src/lib/business-plan/hooks/useBusinessPlanStep.js` | Expose `listStep`, `listWorkOrder` ra component |
| `src/components/workflow-approval/hooks/useWorkflowApproval.js` | Tính icon/status cho từng step |
| `src/components/workflow-approval/WorkflowApproval.jsx` | Render Steps bar + grid layout |
| `src/components/workflow-approval/components/ApprovalList.jsx` | Render từng approver theo 3 case |
| `src/components/workflow-approval/components/ApprovalItem.jsx` | Render 1 approver card |
