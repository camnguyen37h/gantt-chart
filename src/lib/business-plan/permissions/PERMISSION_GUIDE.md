# Business Plan – Permission Architecture

## Tổng quan

Hệ thống phân quyền Business Plan hoạt động theo mô hình **Role-based Column/Section Visibility**.  
Mỗi user có thể mang nhiều role. Toàn bộ logic kiểm tra được tách biệt hoàn toàn khỏi UI – component chỉ gọi các helper từ hook, không cần biết rule bên trong.

---

## Cấu trúc file

```
src/lib/business-plan/permissions/
├── roles.js             // Hằng số tên role (map từ code sang string trả về từ API)
├── policyMatrix.js      // SCOPE, COL_CAT, PERMISSION_MATRIX — nguồn sự thật duy nhất
├── viewPermissions.js   // Pure functions: getColumnCategory, canViewColumn, canViewSection
└── PERMISSION_GUIDE.md  // (file này)

src/lib/business-plan/hooks/
└── useBusinessPlanPermission.js   // React hook wrapper – dùng trong component
```

---

## Luồng hoạt động

```
API response          localStorage
  userRoles[]    +    permissions[]
       │                   │
       └──────────┬────────┘
                  ▼
         useBusinessPlanPermission(scope)
                  │
         resolvePolicy(allRoles, scope)
                  │   duyệt PERMISSION_MATRIX
                  │   merge tất cả policy khớp role
                  ▼
         policy = { columns, sections?, sectionHeaderOnly? }
                  │
       ┌──────────┴──────────────┐
       ▼                         ▼
  canViewColumn()           canViewSection()
       │                         │
       ▼                         ▼
  perms.renderCell()        perms.filterSections()
  perms.renderColumn()
```

---

## Các khái niệm

### SCOPE
Module / tab hiển thị cần kiểm tra quyền. Mỗi scope có thể có policy riêng cho từng role.

| Constant         | Giá trị            | Dùng cho              |
|------------------|--------------------|-----------------------|
| `SCOPE.TOTAL`    | `'total'`          | Tab Total             |
| `SCOPE.OB`       | `'OB'`             | Tab OB                |
| `SCOPE.ONSITE`   | `'Onsite'`         | Tab Onsite            |
| `SCOPE.OFFSHORE` | `'Offshore'`       | Tab Offshore          |
| `SCOPE.GENERAL`  | `'generalInformation'` | Tab General Info  |
| `SCOPE.REVENUE`  | `'revenuePlan'`    | Tab Revenue Plan      |
| `SCOPE.DELIVERY` | `'deliveryPlan'`   | Tab Delivery Plan     |

### COL_CAT (Column Category)
Phân loại cột dựa trên `columnKey`. Logic nhận dạng nằm trong `getColumnCategory()`:

| Category         | Pattern columnKey      | Ý nghĩa                        |
|------------------|------------------------|--------------------------------|
| `COL_CAT.TOTAL`    | `=== 'TOTAL'`        | Cột tổng hợp                   |
| `COL_CAT.INTERNAL` | `=== 'INTERNAL'`     | Cột nội bộ                     |
| `COL_CAT.ONSITE`   | `startsWith('SALE')` | Các cột Onsite / Sale          |
| `COL_CAT.OFFSHORE` | `startsWith('DELIVERY_UNIT')` | Các cột Offshore / DU |
| `COL_CAT.ALL`      | `'*'` (sentinel)     | Tất cả cột — full access       |

> Nếu `columnTypeMap` được truyền vào hook, nó ghi đè phân loại mặc định (dùng cho cột dynamic).

### Policy object

```js
{
  columns:           string[] | '*',  // COL_CAT nào được xem; '*' = tất cả
  sections:          string[] | null, // null = tất cả section; string[] = chỉ section được liệt kê
  sectionHeaderOnly: boolean,         // true = chỉ xem ở dòng header section, không xem ở data row
}
```

### Merge policy
Khi user có nhiều role, các policy được **merge theo hướng cho phép nhất** (most-permissive):
- `columns`: union của tất cả category được phép
- `sections`: nếu bất kỳ role nào không giới hạn section (`null`) → kết quả không giới hạn
- `sectionHeaderOnly`: chỉ `true` khi **tất cả** role đều yêu cầu `sectionHeaderOnly`

---

## PERMISSION_MATRIX — Cách đọc

```js
[BP_ROLES.DU_ONSITE]: {
  [SCOPE.TOTAL]: {
    columns: [COL_CAT.TOTAL, COL_CAT.ONSITE, COL_CAT.INTERNAL]
  }
}
```
→ Role `DB-DU-Onsite`, trong tab Total: được xem cột TOTAL, ONSITE, INTERNAL. Tất cả section.

```js
[BP_ROLES.BUL_ONSITE]: {
  [SCOPE.TOTAL]: { columns: [COL_CAT.TOTAL], sectionHeaderOnly: true }
}
```
→ Role `DB-BUL-Onsite`, trong tab Total: chỉ được xem cột TOTAL, và chỉ ở dòng section header — data row bị ẩn/mask.

```js
[BP_ROLES.MARGIN_OFFSHORE]: {
  [SCOPE.TOTAL]: { columns: [COL_CAT.TOTAL, COL_CAT.OFFSHORE], sections: ['MARGIN'] }
}
```
→ Role `DB-Margin-Offshore`: chỉ xem được section MARGIN, với cột TOTAL và OFFSHORE.

```js
[BP_ROLES.DB_ADMIN]: { '*': { columns: COL_CAT.ALL } }
```
→ Scope `'*'` là wildcard — áp dụng cho mọi module khi không có policy riêng.

---

## Hook API — `useBusinessPlanPermission`

```js
const perms = useBusinessPlanPermission(SCOPE.TOTAL)
// hoặc với columnTypeMap override:
const perms = useBusinessPlanPermission(SCOPE.TOTAL, { DELIVERY_UNIT_34: 'onsite' })
```

### Các method trả về

| Method | Params | Trả về | Mô tả |
|--------|--------|--------|-------|
| `renderCell` | `(item, columnKey, value, percent?, isSectionHeader?)` | `string` | Format số **hoặc** `'*****'` — **ưu tiên dùng trong JSX** |
| `renderColumn` | `(columnKey, value, percent?, isSectionHeader?)` | `string` | Như trên nhưng không kiểm tra `item.permissionView` |
| `canViewCell` | `(item, columnKey, isSectionHeader?)` | `boolean` | Trả về `true/false` — dùng khi cần rẽ nhánh ngoài format số |
| `canViewColumn` | `(columnKey, isSectionHeader?)` | `boolean` | Chỉ kiểm tra column, không kiểm tra item |
| `canViewSection` | `(sectionKey)` | `boolean` | Kiểm tra section có hiển thị không |
| `filterSections` | `(sectionList)` | `Array` | Lọc mảng section theo quyền |
| `maskedValue` | — | `'*****'` | Hằng số mask, dùng khi tự render ngoài hai helper trên |

### `renderCell` vs `renderColumn`

- **`renderCell`**: kiểm tra cả `item.permissionView === false` (API-level restriction) lẫn column policy
- **`renderColumn`**: chỉ kiểm tra column policy (dùng cho cell không có `item`, ví dụ giá trị tổng tính từ formula)

---

## Cách dùng trong JSX

**Trường hợp thông thường — dùng `renderCell`:**
```jsx
// Thay vì:
perms.canViewCell(item, col) ? formatNumber(value, percent) : perms.maskedValue

// Dùng:
perms.renderCell(item, col, value, percent)
perms.renderCell(item, col, value, percent, true) // isSectionHeader = true
```

**Cột không có item nguồn — dùng `renderColumn`:**
```jsx
perms.renderColumn('TOTAL', sectionTotalValue)
perms.renderColumn('TOTAL', sectionTotalValue, false, true) // section header row
```

**Render phức tạp hơn (có nhánh không phải format số) — dùng `canViewCell`:**
```jsx
{perms.canViewCell(item, columnKey) ? (
  <BusinessPlanInput item={item} />
) : (
  <span>{perms.maskedValue}</span>
)}
```

---

## Cách mở rộng

### Thêm role mới
1. Thêm hằng số vào `roles.js`:
```js
NEW_ROLE: 'DB-New-Role',
```
2. Thêm policy vào `PERMISSION_MATRIX` trong `policyMatrix.js`:
```js
[BP_ROLES.NEW_ROLE]: {
  [SCOPE.TOTAL]: { columns: [COL_CAT.TOTAL, COL_CAT.ONSITE] },
},
```
→ Không cần sửa gì thêm.

### Thêm scope mới (module mới)
1. Thêm constant vào `SCOPE` trong `policyMatrix.js`:
```js
export const SCOPE = {
  ...
  NEW_MODULE: 'newModule',
}
```
2. Thêm policy cho các role cần thiết trong `PERMISSION_MATRIX`.
3. Trong component mới: `useBusinessPlanPermission(SCOPE.NEW_MODULE)`.

### Cột dynamic (không match pattern cố định)
```js
const columnTypeMap = {
  DELIVERY_UNIT_34: COL_CAT.ONSITE,  // override: cột này là Onsite dù prefix là DELIVERY_UNIT
}
const perms = useBusinessPlanPermission(SCOPE.TOTAL, columnTypeMap)
```

---

## Fallback mặc định

- User không có role nào → `resolvePolicy` trả về `null` → **tất cả cột bị mask**.
- Role có trong `allRoles` nhưng không có entry trong `PERMISSION_MATRIX` → bỏ qua.
- Scope không có policy riêng → fallback sang `policy['*']` nếu có.
