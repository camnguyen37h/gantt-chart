# Fixes & Solutions

## 1. Score Setting — Auto-fill Description từ template string

**File:** `src/lib/performance-score-setting/PerformanceScoreSettingForm.jsx`

**Yêu cầu:** Khi nhập Score (level), Description tự điền `Definition of ${level}`.

**Cách làm:** Dùng `setFieldsValue` trong `onChange` của Input `level`, chỉ override khi description đang rỗng (hoặc còn là giá trị template cũ).

```jsx
// Trong render của cột "level", thêm onChange vào Input:
<Input
  disabled={isNA}
  placeholder="Ex: L0, L1..."
  onChange={e => {
    const newLevel = e.target.value
    const descField = buildFieldName(row.scoreId, 'description')
    const currentDesc = getFieldValue(descField) || ''

    // Chỉ auto-fill nếu description rỗng hoặc vẫn theo pattern cũ
    const isAutoFilled =
      currentDesc === '' || /^Definition of /.test(currentDesc)

    if (isAutoFilled) {
      form.setFieldsValue({ [descField]: `Definition of ${newLevel}` })
    }
  }}
/>
```

> **Lưu ý:** `setFieldsValue` cần được gọi qua `form` prop (Ant Design v3). Vì `form` đã có sẵn trong scope của `PerformanceScoreSettingForm`, không cần truyền thêm gì.

---

## 2. Business Plan Detail — Crash khi click OB mode

**File:** `src/lib/business-plan/hooks/useFormula.js` — hàm `getTotalColumnAndSet` (~line 106)

**Nguyên nhân:** Khi switch sang view OB, một số row không có column tương ứng trong `data[]`. `.find()` trả về `undefined`, rồi code cũ gọi `.value` trên `undefined` → crash.

**Fix:** Guard `childItem` trước khi gọi `getFormula`, và gọi `getFormula` chỉ **một lần** (tránh double-call):

```js
// TRƯỚC (lỗi):
: businessPlanItems[sectionKey].data[key].data.find(
    item => item.columnKey === columnKey
  ).value   // ← crash nếu .find() trả undefined

// SAU (đúng):
if (!childItem) return 0

const formulaResult = getFormula({ item: childItem, columnKey, rowKey: key, sectionKey, isService })
return formulaResult !== undefined ? formulaResult : childItem.value
```

**Đoạn code hoàn chỉnh thay thế trong `values = rowKeys.map(key => { ... })`:**

```js
const values = rowKeys.map(key => {
  const childItem = businessPlanItems[sectionKey].data[key].data.find(
    item => item.columnKey === columnKey
  )

  if (!childItem) return 0   // ← guard thêm vào

  const regex = `${serviceRowKey}_\\d+`
  const isService = key.match(new RegExp(regex))
  const formulaResult = getFormula({
    item: childItem,
    columnKey,
    rowKey: key,
    sectionKey,
    isService,
  })
  return formulaResult !== undefined ? formulaResult : childItem.value
})
```
